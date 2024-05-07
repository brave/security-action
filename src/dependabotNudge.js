const Severity = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3
}

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

export default async function dependabotNudge ({
  org,
  githubToken = null,
  github = null,
  debug = false,
  minlevel = Severity.high,
  skipRepositories = ['chromium'],
  skipHotwords = ['dos', 'denial of service', 'redos', 'denial-of-service', 'memory explosion', 'inefficient regular expression', 'regular expression complexity'],
  defaultContact = ['yan'],
  githubToSlack = {},
  singleOutputMessage = false
}) {
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

  const properties = await github.paginate('GET /orgs/{org}/properties/values', {
    org,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })

  // hash out of properties array
  const props = {}
  for (const prop of properties) {
    props[prop.repository_name] = prop.properties.reduce((obj, item) => {
      obj[item.property_name] = item.value
      return obj
    }, {})
  }

  // get dependabot alerts for each repository
  for (const repo of repos) {
    if (debug) { console.log(`scanning repo ${repo.name} in org ${org}`) }

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

      // get property values for this repository
      const prop = props[repo.name] || { properties: {} }
      const maintainers = (prop.maintainers || '').toLowerCase().split(',').filter(Boolean).map(m => githubToSlack[m] ? githubToSlack[m] : `@${m}`) || []

      if (alerts.length > 0) {
        if (debug) { console.log(`alerts len: ${alerts.length}`) }

        let msg = `[${org}/${repo.name}](https://github.com/${org}/${repo.name}) has \`${alerts.length}\` open security issue(s) in depedencies`
        const critLen = alerts.filter(s => Severity[s.severity] >= Severity.critical).length
        if (critLen > 0) {
          msg += `, **\`${critLen}\` of which are critical**`
        }
        msg += '\n\n---\n\n'

        for (const alert of alerts) {
          const descFirstLine = alert.security_advisory.description
            .split('\n')
            .filter(d => d[0] !== '#')
            .filter(d => d.trim().length > 0)
            .splice(0, 1)
            .map(d => `&gt; ${decodeEntities(d).substring(0, 40)}`)
            .shift()

          msg += `\`${alert.dependency.package.name}\` by \`${alert.security_advisory.cve_id || alert.security_advisory.ghsa_id}\` with a \`${alert.security_advisory.severity}\` severity *${alert.security_advisory.summary}*`
          msg += '\n\n'

          if (descFirstLine && descFirstLine.length > 0) {
            msg += descFirstLine
            msg += '...\n\n'
          }

          msg += `Handle this alert at ${alert.html_url}\n\n`
          msg += '\n\n---\n\n'
        }

        if (maintainers.length > 0) {
          msg += `Maintainers: ${maintainers.join(', ')}`
        } else {
          msg += `**No maintainers listed for the given vulnerabilities, consider migrating and archiving this repository** - ${defaultContact.map(c => `@${c}`).join(', ')}`
        }

        messages.push(msg)
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (debug || singleOutputMessage) { return messages.join('\n\n') } else { return messages }
}
