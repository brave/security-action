export default async function updateRuntimeProperty ({
  githubToken = null,
  github = null,
  debug = false,
  repositories,
  runtime,
  org,
  core
}) {
  if (!github && githubToken) {
    const { Octokit } = await import('octokit')

    github = new Octokit({ auth: githubToken })
  }

  if (!github && !githubToken) {
    throw new Error('either githubToken or github is required!')
  }

  if (!runtime) {
    throw new Error('runtime is required!')
  }

  if (!repositories) {
    throw new Error('repositories is required!')
  }

  if (!org) {
    throw new Error('org is required! No token can modify more than one org property.')
  }

  debug = debug === 'true' || debug === true

  // if repositories is a string, split it on spaces
  if (typeof repositories === 'string') {
    repositories = repositories.split(' ').map(r => r.trim()).map((r) => {
      const s = r.split('/')
      return { org: s[0], name: s[1] }
    }).filter(r => r.org === org)
  }

  for (const repo of repositories) {
    if (debug) { console.log('updating runtime property') }
    if (core) {
      core.setSecret(repo.org)
      core.setSecret(repo.name)
    }

    await github.request('PATCH /orgs/{org}/properties/values', {
      org: repo.org,
      repository_names: [repo.name],
      properties: [
        {
          property_name: 'runtime',
          value: runtime
        }
      ],
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
  }
}
