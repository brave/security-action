function formatInMessage (r) {
  const pushedAt = new Date(r.pushed_at)
  return `- ${r.private ? '😎 ' : ''} ${r.full_name} ${r.html_url}\t🌟 ${r.stargazers_count}🍴${r.forks} - Last pushed ${pushedAt.getFullYear()}/${pushedAt.getMonth()}/${pushedAt.getDay() + 1}\n`
}

module.exports = async ({ github, context, inputs, actionPath, core, debug = false }) => {
  const { default: sendSlackMessage } = await import(`${actionPath}/src/sendSlackMessage.js`)

  const org = context.repo.owner

  const v = await github.paginate('GET /orgs/{org}/repos', {
    org,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })
  const maxOlderDate = ((d) => d.setDate(d.getDate() - 2 * 365))(new Date()) // 2 years
  const reposOlderThanDate = v.filter(r => r.archived === false).filter(r => r.disabled === false).filter(r => new Date(r.pushed_at) < maxOlderDate)
  const forks = reposOlderThanDate.filter(r => r.fork === true)
  const nonForks = reposOlderThanDate.filter(r => r.fork === false)
  // console.log(reposOlderThanDate[0]) // DEBUG

  if (reposOlderThanDate.length === 0) return ''

  let message = `${org} has ${reposOlderThanDate.length} outdated repositories.\nConsider archiving them.`

  if (nonForks.length !== 0) message += '\n\nRepositories:\n'
  for (let i = 0; i < nonForks.length; i++) {
    const r = nonForks[i]
    message += formatInMessage(r)
  }

  if (forks.length !== 0) message += '\n\nForks:\n'
  for (let i = 0; i < forks.length; i++) {
    const r = forks[i]
    message += formatInMessage(r)
  }

  core.setSecret(message)

  if (message.length > 0) { await sendSlackMessage({ debug, username: 'older-than-2y', message, color: 'blue', channel: '#security-hotspots', token: inputs.slack_token }) }
}
