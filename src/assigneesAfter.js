export default async function assigneesAfter ({
  github,
  context
}) {
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
    owner: context.repo.owner,
    name: context.repo.repo,
    prnumber: context.issue.number
  }
  const result = await github.graphql(query, variables)
  const threads = result.repository.pullRequest.reviewThreads
  const assignees = [...new Set(threads.nodes.filter(
    reviewThread => (
      reviewThread.comments.nodes[0].author.login === 'github-actions' &&
                reviewThread.comments.nodes[0].body.includes('<br>Cc ')
    )
  ).map(
    e => e.comments.nodes[0].body
      .replace(/.*<br>Cc(.*)/, '$1')
      .replaceAll('@', '').trim().split(' ')
  ).flat())]

  console.log('assignees: %o', assignees)
  if (assignees.length > 0) {
    return assignees.join('\n')
  } else {
    return process.env.ASSIGNEES.split(/\s+/).filter((str) => str !== '').join('\n')
  }
}
