module.exports = async ({ github, context, inputs, actionPath, core, debug = false }) => {
  const { default: sendSlackMessage } = await import(`${actionPath}/src/sendSlackMessage.js`)

  const query = `query ($owner: String!) {
      repositoryOwner(login: $owner) {
        repositories(last: 100) {
          totalCount
          nodes {
            name
            createdAt
          }
        }
      }
    }`
  const variables = {
    owner: context.repo.owner
  }
  const result = await github.graphql(query, variables)
  const totalCount = result.repositoryOwner.repositories.totalCount

  // DEBUG: console.log("totalCount: %s", totalCount)
  const repositories = result.repositoryOwner.repositories
  const yesterday = ((d) => d.setDate(d.getDate() - 1))(new Date())
  const newerThanADay = repositories.nodes.filter(
    repo => new Date(repo.createdAt) > yesterday
  )
  // DEBUG: console.log("NewerThanADay: %o", newerThanADay);
  let message = ''
  if (newerThanADay.length > 0) {
    message += `${newerThanADay.length} new repos in ${variables.owner}:\n\n`
    for (let i = 0; i < newerThanADay.length; i++) {
      message += `- ${newerThanADay[i].name}\n`
    }
    message += `\nTotal repositories in ${variables.owner}: ${totalCount}`

    core.setSecret(message)
  }

  if (message.trim().length > 0) {
    await sendSlackMessage({
      token: inputs.slack_token,
      message: `[check-new-repos] ${message}`,
      channel: '#secops-hotspots',
      color: 'yellow',
      username: 'check-new-repos'
    })
  }
}
