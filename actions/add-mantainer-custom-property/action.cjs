module.exports = async ({ github, context, inputs, actionPath, core, debug = false }) => {
  const { default: addMaintainerCustomProperty } = await import(`${actionPath}/src/addMaintainerCustomProperty.js`)
  const { default: sendSlackMessage } = await import(`${actionPath}/src/sendSlackMessage.js`)

  const reposWithoutMaintainer = await addMaintainerCustomProperty({
    org: context.repo.owner,
    github,
    ignoreMaintainers: inputs.ignore_maintainers,
    debug
  })

  if (reposWithoutMaintainer.trim().length > 0) {
    await sendSlackMessage({
      token: inputs.slack_token,
      message: `[add-maintainer-custom-property] ${reposWithoutMaintainer}`,
      channel: '#secops-hotspots',
      color: 'yellow',
      username: 'add-maintainer-custom-property'
    })
  }
}
