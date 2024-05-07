export default async function addMaintainerCustomProperty ({
  org,
  githubToken = null,
  github = null,
  ignoreMaintainers = [],
  debug = false,
  simpleScan = false,
  skipRepositories = ['chromium']
}) {
  const watermark = "The following repositories should be archived since they don't have any maintainer:\n"
  let output = ''

  if (!github && githubToken) {
    const { Octokit } = await import('octokit')

    github = new Octokit({ auth: githubToken })
  }

  if (!github && !githubToken) {
    throw new Error('either githubToken or github is required!')
  }

  debug = debug === 'true' || debug === true
  simpleScan = simpleScan === 'true' || simpleScan === true

  if (debug) { console.log(`simpleScan: ${simpleScan} ${typeof simpleScan}`) }

  // if ignoreMaintainers is a string, split it on commas
  if (typeof ignoreMaintainers === 'string') {
    ignoreMaintainers = ignoreMaintainers.split(',')
  }

  // if skipRepositories is a string, split it on commas
  if (typeof skipRepositories === 'string') {
    skipRepositories = skipRepositories.split(',')
  }

  // get all repositories in this organization
  const repos = Array.from(await github.paginate(github.rest.repos.listForOrg, {
    org,
    type: 'all'
  })).filter(r => r.archived === false).filter(r => r.disabled === false)

  if (debug) { console.log(`repos len: ${repos.length}`) }

  // get all the users in this organization
  const orgUsers = await github.paginate(github.rest.orgs.listMembers, {
    org
  })

  if (debug) { console.log(`orgUsers len: ${orgUsers.length}, ${orgUsers.map(u => u.login)}`) }

  // list contributors for each repository
  for (const repo of repos) {
    if (simpleScan === false) { break }

    if (skipRepositories.includes(repo.name)) { continue }

    try {
      if (debug) { console.log(`simple scanning repo ${repo.name} in org ${org}`) }

      const contributors = await github.paginate(github.rest.repos.listContributors, {
        owner: org,
        repo: repo.name
      })

      // filter contributors to only those who are members of the organization
      const orgContributors = contributors
        .filter(c => orgUsers.find(u => u.login === c.login))
        .sort((a, b) => b.contributions - a.contributions).map(c => c.login)

      if (orgContributors.length > 0) {
        await github.request('PATCH /orgs/{org}/properties/values', {
          org,
          repository_names: [repo.name],
          properties: [
            {
              property_name: 'maintainers',
              value: orgContributors.slice(0, 3).join(',') || null
            }
          ],
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        })
      } else {
        if (!(repo.private || repo.archived || repo.disabled)) {
          output += `- https://github.com/${org}/${repo.name} ${org}/${repo.name}\n`
        }
      }
    } catch (e) {
      if (debug) console.log(e)
    }
  }

  // filter out archived repositories
  // get all the commits for each repository, after a certain date
  for (const repo of repos) {
    if (simpleScan === true) { break }

    if (skipRepositories.includes(repo.name)) { continue }

    if (debug) { console.log(`scanning repo ${repo.name} in org ${org}`) }

    const repoMaintainers = {}

    const commits = await github.paginate(github.rest.repos.listCommits, {
      owner: org,
      repo: repo.name,
      since: new Date(((d) => d.setDate(d.getDate() - 2 * 365))(new Date())).toISOString() // older than 2 years
    })

    // get the author of each commit
    for (const commit of commits) {
      // create a map between the author and the number of commits
      if (commit.author) {
        if (repoMaintainers[commit.author.login]) {
          repoMaintainers[commit.author.login] += 1
        } else {
          repoMaintainers[commit.author.login] = 1
        }
      }
    }

    // create an ordered array by number of commits
    const sortedRepoMaintainers = Object.keys(repoMaintainers)
      .sort((a, b) => repoMaintainers[b] - repoMaintainers[a]).filter(c => orgUsers.find(u => u.login === c))
      .filter(u => !u.endsWith('[bot]')).filter(u => !ignoreMaintainers.includes(u)).slice(0, 3)

    if (debug) console.log(`sortedRepoMaintainers: ${sortedRepoMaintainers}`)

    if (sortedRepoMaintainers.length > 0) {
      await github.request('PATCH /orgs/{org}/properties/values', {
        org,
        repository_names: [repo.name],
        properties: [
          {
            property_name: 'maintainers',
            value: sortedRepoMaintainers.join(',') || null
          }
        ],
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })
    } else {
      if (!(repo.private || repo.archived || repo.disabled)) {
        output += `- https://github.com/${org}/${repo.name} ${org}/${repo.name}\n`
      }
    }
  }

  if (output.length > 0) {
    output = watermark + output
  }

  return output
};
