import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import pullRequestChangedFiles from '../../src/pullRequestChangedFiles.js'

function filesPage (nodes, hasNextPage, pageIndex) {
  return {
    nodes,
    pageInfo: { endCursor: `p${pageIndex}`, hasNextPage }
  }
}

function prGithub (this_, prnumber) {
  const pages = this_.prPages[prnumber] || []
  this_.github = this_.makeMockGithub({
    graphqlHandler: (query, variables) => {
      const idx = variables.cursor ? Number(variables.cursor.slice(1)) : 0
      const nodes = pages[idx] || []
      const hasNextPage = idx + 1 < pages.length
      return {
        repository: {
          pullRequest: {
            files: filesPage(nodes, hasNextPage, hasNextPage ? idx + 1 : idx)
          }
        }
      }
    }
  })
}

Given(/the pull request (\d+) has file pages/, function (prnumber, table) {
  this.prPages = this.prPages || {}
  this.prPages[prnumber] = [table.raw().map(([path, additions]) => ({ path, additions: Number(additions) }))]
  prGithub(this, prnumber)
})

Given(/more file pages for pull request (\d+)/, function (prnumber, table) {
  this.prPages[prnumber].push(table.raw().map(([path, additions]) => ({ path, additions: Number(additions) })))
  prGithub(this, prnumber)
})

When('listing the changed files of pull request {int}', async function (prnumber) {
  prGithub(this, prnumber)
  await this.attempt(() => pullRequestChangedFiles({
    github: this.github,
    owner: this.owner,
    name: this.repo,
    prnumber
  }))
})

When('listing the changed files of pull request {string}', async function (prnumber) {
  prGithub(this, prnumber)
  await this.attempt(() => pullRequestChangedFiles({
    github: this.github,
    owner: this.owner,
    name: this.repo,
    prnumber
  }))
})

When('listing the changed files without a github client', async function () {
  await this.attempt(() => pullRequestChangedFiles({
    owner: this.owner,
    name: this.repo,
    prnumber: 7
  }))
})

Then('the changed files are {string}', function (paths) {
  assert.deepEqual(this.result, paths.split(','))
})

Then('the graphql query ran {int} times', function (count) {
  assert.equal(this.github.__recorder.count('graphql'), count)
})
