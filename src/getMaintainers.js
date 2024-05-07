export default async function getMaintainers ({
  org,
  githubToken = null,
  github = null
}) {
  if (!github && githubToken) {
    const { Octokit } = await import('octokit')

    github = new Octokit({ auth: githubToken })
  }

  if (!github && !githubToken) {
    throw new Error('either githubToken or github is required!')
  }

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

  let maintainers = ''

  for (const repo of Object.keys(props).sort()) {
    if (props[repo].maintainers) {
      maintainers += `- https://github.com/${org}/${repo} maintainers: ${props[repo].maintainers.split(',').join(', ')}\n`
    }
  }

  return maintainers
}
