async function getConfig ({ github, owner, repo, paths, debug }) {
  if (typeof paths === 'string') {
    paths = [paths]
  }

  for (const path of paths) {
    try {
      const { data } = await github.rest.repos.getContent({
        owner,
        repo,
        path
      })
      const fileContent = Buffer.from(data.content, 'base64').toString('utf8')
      if (debug) console.log(fileContent)
      return JSON.parse(fileContent)
    } catch (err) {
      if (debug) console.log(err)
    }
  }

  return null
}

// for all repositories in org, get renovate.json config and verify if it extends the company config
// if it doesn't, send a message to slack channel
export default async function renovateSanityCheck ({
  org,
  githubToken = null,
  github = null,
  debug = false,
  skipRepositories = ['chromium', 'renovate-config']
}) {
  const norenovateMessages = []
  const noncompliantMessages = []

  if (!github && githubToken) {
    const { Octokit } = await import('octokit')

    github = new Octokit({ auth: githubToken })
  }

  if (!github && !githubToken) {
    throw new Error('either githubToken or github is required!')
  }

  debug = debug === 'true' || debug === true

  // if skipRepositories is a string, split it on commas
  if (typeof skipRepositories === 'string') {
    skipRepositories = skipRepositories.split(',')
  }

  // get all repositories in this organization
  const repos = Array.from(await github.paginate(github.rest.repos.listForOrg, {
    org,
    type: 'all'
  })).filter(r => r.archived === false)
    .filter(r => r.disabled === false)
    .filter(r => r.fork === false)
    .filter(r => !skipRepositories.includes(r.name))

  for (const repo of repos) {
    // renovate.json
    // renovate.json5
    // .github/renovate.json
    // .github/renovate.json5
    // .gitlab/renovate.json
    // .gitlab/renovate.json5
    // .renovaterc
    // .renovaterc.json
    // .renovaterc.json5
    // package.json, that has the json in a `renovate` section

    const paths = [
      'renovate.json',
      'renovate.json5',
      '.github/renovate.json',
      '.github/renovate.json5',
      '.gitlab/renovate.json',
      '.gitlab/renovate.json5',
      '.renovaterc',
      '.renovaterc.json',
      '.renovaterc.json5'
    ]

    let renovateConfig = await getConfig({
      github,
      owner: org,
      repo: repo.name,
      paths,
      debug: false
    })

    if (!renovateConfig) {
      // handle package.json case
      const packageJson = await getConfig({ github, owner: org, repo: repo.name, paths: 'package.json' })
      if (packageJson) {
        renovateConfig = packageJson.renovate
      }
    }

    if (!renovateConfig) {
      const message = `https://github.com/${org}/${repo.name} does not have a renovate config!`
      if (debug) console.log(message)

      norenovateMessages.push(message)
      continue
    }

    if (!(renovateConfig.extends && (renovateConfig.extends.includes(`local>${org}/renovate-config`) || renovateConfig.extends.includes('local>brave/renovate-config')))) {
      const message = `https://github.com/${org}/${repo.name} does not extend the company renovate config!`
      if (debug) console.log(message)

      noncompliantMessages.push(message)
    }
  }

  if (norenovateMessages.length || noncompliantMessages.length) {
    const norenovateOutput = norenovateMessages.map(msg => `- ${msg}`).join('\n')
    const noncompliantOutput = noncompliantMessages.map(msg => `- ${msg}`).join('\n')
    return `The following repositories do not have a renovate config:\n${norenovateOutput}\n\nThe following repositories do not extend the company renovate config:\n${noncompliantOutput}`
  }
}
