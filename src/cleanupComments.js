export default async function cleanupComments ({
  github,
  githubToken,
  context
}) {
  if (!github && githubToken) {
    const { Octokit } = await import('octokit')

    github = new Octokit({ auth: githubToken })
  }

  const query = `query($owner:String!, $name:String!, $prnumber:Int!) { 
        repository(owner:$owner, name:$name) { 
          pullRequest(number:$prnumber) {
            reviewThreads(last:100) {
              nodes {
                isOutdated
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
  const deletableComments = threads.nodes.filter(
    reviewThread => (
      reviewThread.isOutdated === true &&
          reviewThread.comments.totalCount === 1 &&
          reviewThread.comments.nodes[0].author.login === 'github-actions' &&
          reviewThread.comments.nodes[0].body.includes('<br>Cc ')
    )
  ).map(
    reviewThread => (
      reviewThread.comments.nodes[0].id
    )
  )
  console.log('Delete', deletableComments)
  if (deletableComments) {
    const deleteMutation = `mutation($comment:ID!) {
          deletePullRequestReviewComment(input: {id:$comment}) {
            clientMutationId
          }
        }`
    for (const commentId of deletableComments) {
      console.log('Deleting %s', commentId)
      await github.graphql(deleteMutation, { comment: commentId })
    }
  }
}
