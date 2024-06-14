module.exports = async ({ github, context, inputs, actionPath, core, debug = false }) => {
  const { default: kubeGetRepositories } = await import(`${actionPath}/src/kubeGetRepositories.js`)
  const { default: updateRuntimeProperty } = await import(`${actionPath}/src/updateRuntimeProperty.js`)
  const org = context.repo.owner

  if (inputs.static_repositories) {
    await updateRuntimeProperty({
      github,
      org,
      runtime: 'static',
      repositories: inputs.static_repositories,
      debug
    })
  }

  if (inputs.runtime_directory) {
    const repositories = await kubeGetRepositories({
      directory: inputs.runtime_directory,
      orgFilter: new RegExp(`^${org}$`),
      debug
    })

    await updateRuntimeProperty({
      github,
      org,
      core,
      runtime: 'bsg',
      repositories,
      debug
    })
  }
}
