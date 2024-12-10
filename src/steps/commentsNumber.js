// regex to match "<!-- Category: <category> -->"
const categoryRegex = /<!-- Category: ([^<]+) -->/

export default async function commentsNumber ({
  github,
  githubToken,
  context
}) {
  if (!github && githubToken) {
    const { Octokit } = await import('octokit')

    github = new Octokit({ auth: githubToken })
  }

  const categories = new Set()

  const query = `query($owner:String!, $name:String!, $prnumber:Int!) { 
        repository(owner:$owner, name:$name) { 
          pullRequest(number:$prnumber) {
            reviewThreads(last:100) {
              nodes {
                isOutdated
                comments(first:1) {
                  totalCount
                  nodes {
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
  const comments = threads.nodes.filter(
    reviewThread => (
      !(reviewThread.isOutdated === true && reviewThread.comments.totalCount === 1) &&
          reviewThread.comments.nodes[0].author.login === 'github-actions' &&
          reviewThread.comments.nodes[0].body.includes('<br>Cc ')
    )
  ).map(reviewThread => reviewThread.comments.nodes[0])

  for (const comment of comments) {
    const category = comment.body.match(categoryRegex)?.[1]
    if (category) {
      categories.add(category)
    }
  }
  console.log('Comments: %d', comments.length)
  return { number: comments.length, categories: Array.from(categories) }
}
