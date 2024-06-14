export default async function kubeGetRepositories ({
  debug = false,
  orgFilter,
  directory
}) {
  if (!directory) {
    throw new Error('directory is required!')
  }

  if (!orgFilter) {
    orgFilter = /.*/
  }

  if (typeof orgFilter === 'string') {
    orgFilter = new RegExp(orgFilter)
  }

  debug = debug === 'true' || debug === true

  const fs = await import('fs')
  const yaml = await import('js-yaml')
  const glob = await import('glob')

  const files = glob.sync(`${directory}/**/*.yaml`)
  if (debug) { console.log(`files: ${files.length}`) }
  const repos = []
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')
    yaml.loadAll(content, (doc) => {
      if (doc && doc.kind === 'GitRepository' && doc.spec.url) {
        repos.push(doc.spec.url)
      }
    })
  }

  const uniqueRepos = [...new Set(repos)].sort().map((url) => {
    // url in the format of ssh://git@github.com/example-org/example-ops
    // get the last two elements and return an object with organization and name
    const parts = url.split('/')
    const name = parts.pop()
    const organization = parts.pop()

    return { org: organization, name }
  })

  return uniqueRepos.filter(r => orgFilter.test(r.org))
}
