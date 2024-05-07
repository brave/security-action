import fs from 'node:fs/promises'

const Severity = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3
}

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
  let message = ''

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

    message += `- [${a.security_advisory.summary} in \`${org}/${a.repository.name}\`](${a.html_url})\n`

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

  if (message.length > 0) {
    return watermark + message
  } else {
    return ''
  }
}
