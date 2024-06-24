export default async function assigneesAfter ({
  github,
  githubToken,
  context,
  owner,
  repo,
  number,
  assignees
}) {
  if (!github && githubToken) {
    const { Octokit } = await import('octokit')

    github = new Octokit({ auth: githubToken })
  }

  if (!github) {
    throw new Error('github or githubToken is required')
  }

  if (typeof number === 'string') {
    number = parseInt(number, 10)
  }

  const query = `query($owner:String!, $name:String!, $prnumber:Int!) { 
              repository(owner:$owner, name:$name) { 
                pullRequest(number:$prnumber) {
                  reviewThreads(last:100) {
                    nodes {
                      comments(first:1) {
                        totalCount
                        nodes {
                          id
                          author {
                            login
                          }
                          body
                        }
                      }
                    }
                  }
                }
              }
            }`
  const variables = {
    owner: owner || context.repo.owner,
    name: repo || context.repo.repo,
    prnumber: number || context.issue.number
  }
  const result = await github.graphql(query, variables)
  const threads = result.repository.pullRequest.reviewThreads
  const outputAssignees = [...new Set(threads.nodes.filter(
    reviewThread => (
      reviewThread.comments.nodes[0].author.login === 'github-actions' &&
                reviewThread.comments.nodes[0].body.includes('<br>Cc ')
    )
  ).map(
    e => e.comments.nodes[0].body
      .replace(/\n<!--(.*) -->\n/, '')
      .replace(/.*<br>Cc(.*)/, '$1')
      .replaceAll('@', '').trim().split(' ')
  ).flat())]

  console.log('assignees: %o', outputAssignees)
  if (outputAssignees.length > 0) {
    return outputAssignees.join('\n')
  } else {
    return assignees.split(/\s+/).filter((str) => str !== '').join('\n')
  }
}
