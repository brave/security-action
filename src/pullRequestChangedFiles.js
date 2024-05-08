export default async function pullRequestChangedFIles ({ github, githubToken, owner, name, prnumber }) {
  if (!github && githubToken) {
    const { Octokit } = await import('octokit')

    github = new Octokit({ auth: githubToken })
  }

  if (!github && !githubToken) {
    throw new Error('either githubToken or github is required!')
  }

  prnumber = parseInt(prnumber, 10)

  const query = `query ($owner: String!, $name: String!, $prnumber: Int!, $cursor: String) {
    repository(owner: $owner, name: $name) {
      pullRequest(number: $prnumber) {
        files(first: 100, after: $cursor) {
          pageInfo {
            endCursor
            hasNextPage
          }
          nodes {
            path
            additions
            deletions
          }
        }
      }
    }
  }`

  const vars = {
    owner,
    name,
    prnumber
  }

  let hasNextPage = true
  let paths = []
  while (hasNextPage) {
    const { repository } = await github.graphql(query, vars)
    const files = repository.pullRequest.files

    // prepare the next iteration
    hasNextPage = files.pageInfo.hasNextPage
    vars.cursor = files.pageInfo.endCursor

    // append new paths to paths array
    // check for additions only, deletions are not relevant, in this case
    paths = paths.concat(
      files.nodes.filter(file => file.additions /* + file.deletions */ > 0).map(file => file.path))
  }

  return paths
}
