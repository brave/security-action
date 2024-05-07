export default async function hotwords ({
  github,
  githubToken,
  context
}) {
  const { HOTWORDS } = process.env
  const hotwords = HOTWORDS.split('\n').map(s => s.trim()).filter((s) => s !== '')

  console.log('hotwords: %s', hotwords)

  const pullRequestQuery = `query($owner:String!, $name:String!, $prnumber:Int!) { 
      repository(owner:$owner, name:$name) { 
        pullRequest(number:$prnumber) {
          title
          body
        }
      }
    }`
  const variables = {
    owner: context.repo.owner,
    name: context.repo.repo,
    prnumber: context.issue.number
  }
  const result = await github.graphql(pullRequestQuery, variables)
  const content = (result.repository.pullRequest.title + result.repository.pullRequest.body).toLowerCase()
  console.log('Body: %s', content)

  const ret = hotwords.some((word) => content.includes(word))
  console.log('hotword hit: %s', ret)

  if (ret) {
    const m = `The security team is monitoring all repositories for certain keywords. This PR includes the word(s) "${hotwords.filter(word => content.includes(word)).join(', ')}" and so security team members have been added as reviewers to take a look.<br/>
        No need to request a full security review at this stage, the security team will take a look shortly and either clear the label or request more information/changes.<br/>
        Notifications have already been sent, but if this is blocking your merge feel free to reach out directly to the security team on Slack so that we can expedite this check.`

    const pullRequestCommentsQuery = `query($owner:String!, $name:String!, $prnumber:Int!) { 
        repository(owner:$owner, name:$name) { 
          pullRequest(number:$prnumber) {
            comments(first: 100) {
              nodes {
                author { login }
                body
                bodyHTML
                bodyText
              }
            }
          }
        }
      }`
    const messages = (await github.graphql(pullRequestCommentsQuery, variables)).repository.pullRequest.comments.nodes.map(node => node.body)

    if (!messages.includes(m)) {
      github.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
        body: m
      })
    }
  }

  return ret
}
