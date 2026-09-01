import {
  Severity,
  DEFAULT_SKIP_HOTWORDS
} from './dependabotConstants.js'
import { messageToBlocks } from './sendSlackMessage.js'

// original code at: https://stackoverflow.com/questions/44195322/a-plain-javascript-way-to-decode-html-entities-works-on-both-browsers-and-node
function decodeEntities (encodedString) {
  const translateRe = /&(nbsp|amp|quot|lt|gt);/g
  const translate = {
    nbsp: ' ',
    amp: '&',
    quot: '"',
    lt: '<',
    gt: '>'
  }
  return encodedString.replace(translateRe, function (match, entity) {
    return translate[entity]
  }).replace(/&#(\d+);/gi, function (match, numStr) {
    const num = parseInt(numStr, 10)
    return String.fromCharCode(num)
  })
}

function alertSeverity (alert) {
  return Severity[alert.security_advisory?.severity || alert.severity]
}

// The most severe member of a group: a grouped issue is never
// rendered or counted below its worst rating.
function worstAlert (group) {
  return group.reduce((worst, a) =>
    alertSeverity(a) > alertSeverity(worst) ? a : worst)
}

function criticalCount (alerts) {
  return alerts.filter(a => alertSeverity(a) >= Severity.critical).length
}

// Group alerts that are the same advisory on the same package.
// Dependabot opens one alert per manifest, so a package present
// in two lockfiles yields two alerts for a single issue; without
// grouping the thread would show the same CVE twice (e.g. bn.js
// CVE-2026-2739 as alerts #125 and #112). Grouping is per
// package: the same advisory in two different packages is two
// dependency problems, not one.
export function groupAlerts (alerts) {
  const groups = new Map()
  for (const alert of alerts) {
    const key =
      `${alert.dependency.package.name}|` +
      `${alert.security_advisory.cve_id || alert.security_advisory.ghsa_id}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(alert)
  }
  return [...groups.values()]
}

// Only the findings, no summary line. The summary belongs on the
// thread parent (buildParentText), the findings in the replies.
// Shared with the refresh path (refreshNudgeThread.js) so an
// updated thread is rendered exactly like the original nudge.
// Counts and entries are per unique advisory-package issue, not
// per alert; duplicates list their extra alert URLs.
export function buildRepoMessage ({ alerts }) {
  let message = ''
  const groups = groupAlerts(alerts)

  for (const group of groups) {
    const alert = worstAlert(group)

    const descFirstLine = alert.security_advisory.description
      .split('\n')
      .filter(d => d[0] !== '#')
      .filter(d => d.trim().length > 0)
      .splice(0, 1)
      .map(d => `&gt; ${decodeEntities(d).substring(0, 40)}`)
      .shift()

    const devAppend = alert.dependency.scope === 'development' ? ' (dev)' : ''

    message += `\`${alert.dependency.package.name}\` by \`${alert.security_advisory.cve_id || alert.security_advisory.ghsa_id}\` with a \`${alert.security_advisory.severity}\` severity *${alert.security_advisory.summary}*`
    message += devAppend
    message += '\n\n'

    if (descFirstLine && descFirstLine.length > 0) {
      message += descFirstLine
      message += '...\n\n'
    }

    message += `Handle this alert at ${alert.html_url}\n\n`
    for (const extra of group.slice(1)) {
      message += `Also reported at ${extra.html_url}\n\n`
    }
    message += '\n\n---\n\n'
  }

  return {
    message,
    total: groups.length,
    critical: criticalCount(groups.map(worstAlert))
  }
}

// The one-line summary posted as the thread parent. Shared
// with the refresh path so the counts can be corrected in
// place when alerts are dismissed or fixed. Critical count
// is omitted when there are none.
export function buildParentText ({ repo, total, critical }) {
  let text = `[${repo}](https://github.com/${repo}) has \`${total}\` open Dependabot issues`
  if (critical > 0) {
    text += ` (**${critical} critical**)`
  }
  return text
}

// Mentions for the thread reply (which notifies) and for
// the later parent edit (which does not).
export function buildCcLine (maintainers, defaultContact = []) {
  if (maintainers.length > 0) {
    return `cc ${maintainers.join(' ')}`
  }
  const fallback = defaultContact.map(c => `@${c}`).join(' ')
  return `cc ${fallback} - *No maintainers listed for the given vulnerabilities, consider migrating and archiving this repository*`
}

// Parent blocks: the cc is appended inline to the summary
// line, as raw mrkdwn, so the Slack mention pills render in
// the channel overview. It is appended after the markdown-
// to-blocks conversion, which would otherwise escape the
// <@U123> mentions into &lt;@U123&gt;.
export async function buildParentBlocks ({
  repo, total, critical, cc = ''
}) {
  const blocks = await messageToBlocks(
    buildParentText({ repo, total, critical })
  )
  if (cc) {
    const section = blocks.find(b => b.type === 'section')
    if (section) {
      section.text.text += ` (${cc})`
    }
  }
  return blocks
}

// Extract the cc line from a thread parent's blocks: appended
// inline to the summary ('... (cc <@U1>)') by buildParentBlocks
// above, or in its own 'cc ...' section on threads written
// before the inline change. Lives next to the producer so the
// format has a single owner.
export function parentCcLine (blocks) {
  for (const block of blocks || []) {
    if (block.text?.type !== 'mrkdwn') continue
    if (block.text.text.startsWith('cc ')) return block.text.text
    const inline = block.text.text.match(/\((cc [^)]+)\)\s*$/)
    if (inline) return inline[1]
  }
  return ''
}

export default async function dependabotNudge ({
  org,
  githubToken = null,
  github = null,
  debug = false,
  minlevel = Severity.high,
  skipRepositories = ['chromium'],
  skipHotwords = DEFAULT_SKIP_HOTWORDS,
  defaultContact = ['yan'],
  githubToSlack = {},
  singleOutputMessage = false,
  assignMaintainers = true,
  actionPath
}) {
  const { default: getConfig } = await import(`${actionPath}/src/getConfig.js`)
  const { default: getProperties } = await import(`${actionPath}/src/getProperties.js`)

  if (!github && githubToken) {
    const { Octokit } = await import('octokit')

    github = new Octokit({ auth: githubToken })
  }

  if (!github && !githubToken) {
    throw new Error('either githubToken or github is required!')
  }

  const messages = []

  debug = debug === 'true' || debug === true
  singleOutputMessage = singleOutputMessage === 'true' || singleOutputMessage === true

  // if skipRepositories is a string, split it on commas
  if (typeof skipRepositories === 'string') {
    skipRepositories = skipRepositories.split(',')
  }

  // if skipHotwords is a string, split it on commas
  if (typeof skipHotwords === 'string') {
    skipHotwords = skipHotwords.split(',')
  }

  // if minlevel is a string, convert to Severity enum
  if (typeof minlevel === 'string') {
    minlevel = Severity[minlevel]
  }

  // if defaultContact is a string, split it on commas
  if (typeof defaultContact === 'string') {
    defaultContact = defaultContact.split(',')
  }

  // get all repositories in this organization
  const repos = Array.from(await github.paginate(github.rest.repos.listForOrg, {
    org,
    type: 'all'
  })).filter(r => r.archived === false).filter(r => r.disabled === false)

  // get dependabot alerts for each repository
  for (const repo of repos) {
    if (debug) { console.log(`scanning repo ${repo.name} in org ${org}`) }

    const config = await getConfig({ owner: org, repo: repo.name, path: '.github/security-action.json', debug, github })
    const props = await getProperties({ owner: org, repo: repo.name, debug, github, prefix: 'security_action_' })

    const options = Object.assign({
      elected_maintainers: ''
    }, config, props)

    // elected maintainer is a string of comma separated github usernames map.
    // E.g "original_maintainer_1:elected_maintaner_1,original_maintainer_2:elected_maintaner_2"
    // split it and convert to object
    options.elected_maintainers = options.elected_maintainers.split(/\s*,\s*/).reduce((obj, item) => {
      const [original, elected] = item.split(/\s*:\s*/)
      obj[original] = elected
      return obj
    }, {})

    if (skipRepositories.includes(repo.name)) {
      continue
    }

    try {
      const alerts = Array.from(await github.paginate('GET /repos/{owner}/{repo}/dependabot/alerts', {
        owner: org,
        repo: repo.name,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        },
        sort: 'updated',
        state: 'open',
        severity: Object.keys(Severity).filter(s => Severity[s] >= minlevel)
      })).filter(a => !skipHotwords.some(h => a.security_advisory.summary.toLowerCase().includes(h)))
        .filter(a => a.security_vulnerability?.first_patched_version?.identifier)

      // Resolve GitHub usernames for alert assignment (before Slack name conversion)
      const githubMaintainers = (props.maintainers || '').toLowerCase().split(',').filter(Boolean)
        .map(m => options.elected_maintainers[m] || m)

      // Remove duplicates
      const uniqueGithubMaintainers = Array.from(new Set(githubMaintainers))

      // Convert to Slack handles for the message
      let maintainers = uniqueGithubMaintainers
        .map(m => githubToSlack[m] ? githubToSlack[m] : `@${m}`)

      // remove duplicates
      maintainers = Array.from(new Set(maintainers))

      if (alerts.length > 0) {
        if (debug) { console.log(`alerts len: ${alerts.length}`) }

        // Assign maintainers to each alert via the
        // GitHub Dependabot alert assignees API.
        if (assignMaintainers && uniqueGithubMaintainers.length > 0) {
          for (const alert of alerts) {
            try {
              if (debug) {
                console.log(
                  'Would assign ' +
                  uniqueGithubMaintainers.join(', ') +
                  ` to alert #${alert.number}` +
                  ` in ${org}/${repo.name}`
                )
              } else {
                await github.request(
                  'PATCH /repos/{owner}/{repo}' +
                  '/dependabot/alerts/{alert_number}',
                  {
                    owner: org,
                    repo: repo.name,
                    alert_number: alert.number,
                    assignees: uniqueGithubMaintainers,
                    headers: {
                      'X-GitHub-Api-Version':
                        '2022-11-28'
                    }
                  }
                )
                // Small delay to avoid hitting
                // GitHub secondary rate limits.
                await new Promise(
                  resolve => setTimeout(resolve, 200)
                )
              }
            } catch (assignErr) {
              console.error(
                'Failed to assign maintainers to' +
                ` alert #${alert.number}` +
                ` in ${org}/${repo.name}:` +
                ` ${assignErr.message}`
              )
            }
          }
        }

        const { message: msg, total: issueCount, critical: critLen } =
          buildRepoMessage({ alerts })

        // The cc line is kept out of `message` on purpose:
        // it has to be posted through Slack's raw mrkdwn
        // path, because the markdown-to-blocks conversion
        // escapes `<@U123>` mentions into `&lt;@U123&gt;`
        // and nobody gets notified. Posting it last also
        // keeps it to a single notification per thread.
        const cc = buildCcLine(maintainers, defaultContact)

        messages.push({
          repo: `${org}/${repo.name}`,
          message: msg,
          cc,
          total: issueCount,
          critical: critLen,
          alerts
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Only singleOutputMessage flattens the result: debug must
  // not change the return type, or the per-repo caller ends
  // up iterating the characters of a string.
  // The flattened form has no thread parent to carry the
  // summary, so it gets one prepended per repo.
  if (singleOutputMessage) {
    return messages
      .map(m =>
        buildParentText(m) + '\n\n---\n\n' + m.message + m.cc
      )
      .join('\n\n')
  } else {
    return messages
  }
}
