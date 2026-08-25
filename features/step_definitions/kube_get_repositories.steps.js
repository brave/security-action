import { Given, When, Then, After } from '@cucumber/cucumber'
import assert from 'assert'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import kubeGetRepositories from '../../src/kubeGetRepositories.js'

function manifest (kind, url) {
  const spec = url ? `  url: ${url}\n` : '  foo: bar\n'
  return `apiVersion: source.toolkit.fluxcd.io/v1\nkind: ${kind}\nmetadata:\n  name: example\nspec:\n${spec}`
}

Given('a kube directory with a manifest for {string}', function (url) {
  this.kubeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bdd-kube-'))
  fs.writeFileSync(path.join(this.kubeDir, 'manifest.yaml'), manifest('GitRepository', url))
})

Given('a kube directory with a manifest of kind {string} for {string}', function (kind, url) {
  this.kubeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bdd-kube-'))
  fs.writeFileSync(path.join(this.kubeDir, 'manifest.yaml'), manifest(kind, url))
})

Given('a kube directory with a GitRepository manifest without a url', function () {
  this.kubeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bdd-kube-'))
  fs.writeFileSync(path.join(this.kubeDir, 'manifest.yaml'), manifest('GitRepository', null))
})

Given('another manifest for {string}', function (url) {
  fs.writeFileSync(path.join(this.kubeDir, `extra-${Date.now()}.yaml`), manifest('GitRepository', url))
})

Given('a kube directory with a multi-document manifest for {string} and {string}', function (urlA, urlB) {
  this.kubeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bdd-kube-'))
  fs.writeFileSync(
    path.join(this.kubeDir, 'manifest.yaml'),
    `${manifest('GitRepository', urlA)}\n---\n${manifest('GitRepository', urlB)}\n`
  )
})

After(function () {
  if (this.kubeDir) {
    fs.rmSync(this.kubeDir, { recursive: true, force: true })
    this.kubeDir = null
  }
})

When('getting the kube repositories', async function () {
  await this.attempt(() => kubeGetRepositories({ directory: this.kubeDir }))
})

When('getting the kube repositories filtered by org {string}', async function (orgFilter) {
  await this.attempt(() => kubeGetRepositories({ directory: this.kubeDir, orgFilter }))
})

When('getting the kube repositories filtered by org regex {string}', async function (orgFilter) {
  await this.attempt(() => kubeGetRepositories({ directory: this.kubeDir, orgFilter }))
})

When('getting the kube repositories without a directory', async function () {
  await this.attempt(() => kubeGetRepositories({}))
})

Then('the repositories are {string}', function (repos) {
  const expected = repos.split(',').map(full => {
    const [org, name] = full.split('/')
    return { org, name }
  })
  assert.deepEqual(this.result, expected)
})

Then('no repositories are found', function () {
  assert.deepEqual(this.result, [])
})
