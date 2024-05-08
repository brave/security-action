export default async function assigneesAfter ({
  github,
  context,
  assignees
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
  const outputAssignees = [...new Set(threads.nodes.filter(
    reviewThread => (
      reviewThread.comments.nodes[0].author.login === 'github-actions' &&
                reviewThread.comments.nodes[0].body.includes('<br>Cc ')
    )
  ).map(
    e => e.comments.nodes[0].body
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
