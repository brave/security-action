import fs from 'node:fs/promises'
import { Severity } from './dependabotConstants.js'

export default async function dependabotDismiss ({
  org,
  minlevel = Severity.low,
  debug = false,
  hotwords = [' dos ',
    'denial of service',
    'redos',
    'denial-of-service',
    'memory explosion',
    'inefficient regular expression',
    'regular expression complexity'],
  githubToken = null,
  github = null,
  actor = 'security-action',
  dependabotDismissConfig = 'dependabot-dismiss.txt'
}) {
  const watermark = 'The following alerts were dismissed:\n\n'
  const dismissed = []
  const dismissedRepos = new Set()

  let dependabotDismissIds = []

  try {
    dependabotDismissIds = (await fs.readFile(dependabotDismissConfig, 'utf-8')).split('\n').map(l => l.trim()).filter(Boolean)
  } catch (e) {
    if (debug) console.log(`Could not read ${dependabotDismissConfig}: ${e}`)
  }

  if (!github && githubToken) {
    const { Octokit } = await import('octokit')

    github = new Octokit({ auth: githubToken })
  }

  if (!github && !githubToken) {
    throw new Error('either githubToken or github is required!')
  }

  debug = debug === 'true' || debug === true

  if (typeof minlevel === 'string') {
    minlevel = Severity[minlevel]
  }

  const alerts = Array.from(await github.paginate('GET /orgs/{org}/dependabot/alerts', {
    org,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    },
    sort: 'updated',
    state: 'open',
    severity: Object.keys(Severity).filter(s => Severity[s] >= minlevel)
  })).filter(a =>
    hotwords.some(h => a.security_advisory.summary.toLowerCase().includes(h)) ||
            dependabotDismissIds.includes(a.security_advisory.ghsa_id) ||
            dependabotDismissIds.includes(a.security_advisory.cve_id)
  )

  for (const a of alerts) {
    // get the first hotword that matches the summary
    const hotword = hotwords.find(h => a.security_advisory.summary.toLowerCase().includes(h))
    const matchId = dependabotDismissIds.find(id => a.security_advisory.ghsa_id === id || a.security_advisory.cve_id === id)
    let dismissComment = `Dismissed by ${actor}`
    if (matchId) {
      dismissComment += ` because the alert matched the id "${matchId}"`
    } else {
      dismissComment += ` because the alert summary contains the hotword "${hotword}"`
    }

    dismissed.push({
      summary: a.security_advisory.summary,
      repo: `${org}/${a.repository.name}`,
      number: a.number,
      html_url: a.html_url
    })
    dismissedRepos.add(`${org}/${a.repository.name}`)

    if (debug) {
      console.log(dismissComment)
      console.log(`Summary: ${a.security_advisory.summary}`)
      console.log(`GHSA: ${a.security_advisory.ghsa_id}`)
      console.log(`CVE: ${a.security_advisory.cve_id}`)
      continue
    }

    await github.request('PATCH /repos/{org}/{repo}/dependabot/alerts/{alert_number}', {
      org,
      repo: a.repository.name,
      alert_number: a.number,
      dismissed_reason: 'tolerable_risk',
      dismissed_comment: dismissComment,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      },
      state: 'dismissed'
    })
  }

  // One line per package+repo: repeated dismissals of the same
  // advisory (e.g. the same manifest duplicated across lockfiles)
  // collapse into a single bullet with back-references to the
  // other alert numbers, and the list is sorted by summary so
  // the same package lands in the same place every week.
  const groups = new Map()
  for (const d of dismissed) {
    const key = `${d.summary.toLowerCase()}\n${d.repo}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(d)
  }
  const lines = [...groups.values()]
    .map(group => group.sort((a, b) => a.number - b.number))
    .map(([first, ...extras]) =>
      `- [${first.summary} in \`${first.repo}\`](${first.html_url})` +
      (extras.length > 0 ? ` (also in ${extras.map(e => `[#${e.number}](${e.html_url})`).join(', ')})` : ''))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  const message = lines.join('\n') + (lines.length > 0 ? '\n' : '')

  return {
    message: message.length > 0 ? watermark + message : '',
    dismissedRepos: Array.from(dismissedRepos)
  }
}
