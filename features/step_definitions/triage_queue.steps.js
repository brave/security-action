import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { buildQueue } from '../../src/triage/queue.js'
import { computeMetrics } from '../../src/triage/metrics.js'

const FP_CASE_A = {
  case_id: 'owasp_fp_case_a',
  folder_root: '/root/analysis/BenchmarkJava',
  scan_root: '.',
  tool: ['Scanner'],
  file: 'src/BenchmarkTest00001.java',
  raw_output: { Scanner: [{ ruleId: 'java/ssrf', message: { text: 'x' } }] }
}

const FP_CASE_B = { ...FP_CASE_A, case_id: 'owasp_fp_case_b', file: 'src/BenchmarkTest00002.java' }
const TP_CASE_C = { ...FP_CASE_A, case_id: 'owasp_tp_case_c', file: 'src/BenchmarkTest00003.java' }
const TP_CASE_D = { ...FP_CASE_A, case_id: 'owasp_tp_case_d', file: 'src/BenchmarkTest00004.java' }

const OWASP_CSV = `# test name, category, real vulnerability, cwe
owasp_fp_case_a,pathtraver,true,22
owasp_fp_case_b,pathtraver,true,22
owasp_tp_case_c,xss,false,79
owasp_tp_case_d,xss,false,79
`

const VUL_CASE_1 = {
  case_id: 'VUL4J-15_file_1',
  folder_root: '/root/analysis/vul4j_repos/original/VUL4J-15',
  scan_root: '.',
  tool: ['Scanner'],
  file: 'src/main/java/F.java',
  raw_output: { Scanner: [{ ruleId: 'java/xss', message: { text: 'x' } }] }
}

const VUL_MANIFEST = {
  seed: 42,
  sample_count: 2,
  sampled_alerts: [
    { case_id: 'VUL4J-15_file_1', vul4j_id: 'VUL4J-15', ground_truth: 'TP', rule_id: 'java/xss' },
    { case_id: 'VUL4J-16_file_1', vul4j_id: 'VUL4J-16', ground_truth: 'TP', rule_id: 'java/xxe' }
  ]
}

const VUL_CSV = 'vul_id,cwe_id\nVUL4J-15,79\nVUL4J-16,22\n'

const OSS_CASE_1 = {
  case_id: 'mpv-123_file.c_abc__agent',
  alert_id: 'mpv-123_file.c_abc',
  folder_root: '/root/analysis/oss_fuzz_pipeline/batches/current_pool/snapshots/buggy/mpv-123',
  scan_root: '.',
  tool: ['Scanner'],
  file: 'player/f.c',
  raw_output: { Scanner: [{ ruleId: 'cpp/unused-static-variable', message: { text: 'x' } }] },
  prompt_variant: 'agent'
}

const OSS_CASE_2 = { ...OSS_CASE_1, case_id: 'libhevc-9_f.c_def__agent', alert_id: 'libhevc-9_f.c_def', folder_root: '/root/analysis/oss_fuzz_pipeline/batches/current_pool/snapshots/buggy/libhevc-9' }

const OSS_LABELS = [
  { alert_id: 'mpv-123_file.c_abc', human_ground_truth: 'FP', rule_tags: ['external/cwe/cwe-563'] },
  { alert_id: 'libhevc-9_f.c_def', human_ground_truth: 'TP', rule_tags: ['external/cwe/cwe-119'] }
].map(r => JSON.stringify(r)).join('\n')

Given('fixture dataset directories', function () {
  this.tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'queue-fix-'))
  this.fs = {
    owaspFpDir: path.join(this.tmp, 'owasp_fp'),
    owaspTpDir: path.join(this.tmp, 'owasp_tp'),
    owaspRepoRoot: path.join(this.tmp, 'bench-local'),
    vul4jCaseDir: path.join(this.tmp, 'vul4j_cases'),
    vul4jCheckoutRoot: path.join(this.tmp, 'vul4j-checkouts'),
    ossfuzzTaskDir: path.join(this.tmp, 'ossfuzz_tasks'),
    ossfuzzSnapshotDir: path.join(this.tmp, 'snapshots')
  }
  fs.mkdirSync(this.fs.owaspFpDir)
  fs.mkdirSync(this.fs.owaspTpDir)
  fs.mkdirSync(this.fs.owaspRepoRoot)
  fs.mkdirSync(this.fs.vul4jCaseDir)
  fs.mkdirSync(this.fs.ossfuzzTaskDir)
  fs.mkdirSync(path.join(this.fs.ossfuzzSnapshotDir, 'buggy', 'mpv-123'), { recursive: true })
  fs.mkdirSync(path.join(this.fs.ossfuzzSnapshotDir, 'buggy', 'libhevc-9'), { recursive: true })
  fs.mkdirSync(path.join(this.fs.vul4jCheckoutRoot, 'VUL4J-15'), { recursive: true })
  fs.mkdirSync(path.join(this.fs.vul4jCheckoutRoot, 'VUL4J-16'), { recursive: true })
  fs.writeFileSync(path.join(this.fs.owaspRepoRoot, 'expectedresults-1.2.csv'), OWASP_CSV)
  fs.writeFileSync(path.join(this.fs.owaspFpDir, 'a.json'), JSON.stringify(FP_CASE_A))
  fs.writeFileSync(path.join(this.fs.owaspFpDir, 'b.json'), JSON.stringify(FP_CASE_B))
  fs.writeFileSync(path.join(this.fs.owaspTpDir, 'c.json'), JSON.stringify(TP_CASE_C))
  fs.writeFileSync(path.join(this.fs.owaspTpDir, 'd.json'), JSON.stringify(TP_CASE_D))
  fs.writeFileSync(path.join(this.fs.vul4jCaseDir, 'v15.json'), JSON.stringify(VUL_CASE_1))
  fs.writeFileSync(path.join(this.fs.vul4jCaseDir, 'v16.json'), JSON.stringify({ ...VUL_CASE_1, case_id: 'VUL4J-16_file_1', folder_root: '/root/analysis/vul4j_repos/original/VUL4J-16' }))
  fs.writeFileSync(path.join(this.fs.vul4jCaseDir, '..', 'manifest.json'), JSON.stringify(VUL_MANIFEST))
  fs.writeFileSync(path.join(this.tmp, 'vul4j_dataset.csv'), VUL_CSV)
  fs.writeFileSync(path.join(this.fs.ossfuzzTaskDir, 'mpv.json'), JSON.stringify(OSS_CASE_1))
  fs.writeFileSync(path.join(this.fs.ossfuzzTaskDir, 'hevc.json'), JSON.stringify(OSS_CASE_2))
  fs.writeFileSync(path.join(this.tmp, 'pool_labelling.jsonl'), OSS_LABELS)
  this.params.listings = {}
})

Given('a vul4j case {string} with no manifest entry', function (caseId) {
  fs.writeFileSync(path.join(this.fs.vul4jCaseDir, 'orphan.json'), JSON.stringify({ ...VUL_CASE_1, case_id: `${caseId}_1` }))
})

function queueArgs (w) {
  return {
    build: {
      owaspFpDir: w.fs.owaspFpDir,
      owaspTpDir: w.fs.owaspTpDir,
      owaspRepoRoot: w.fs.owaspRepoRoot,
      owaspExpectedResultsCsv: path.join(w.fs.owaspRepoRoot, 'expectedresults-1.2.csv'),
      vul4jCaseDir: w.fs.vul4jCaseDir,
      vul4jManifestPath: path.join(w.fs.vul4jCaseDir, '..', 'manifest.json'),
      vul4jCheckoutRoot: w.fs.vul4jCheckoutRoot,
      vul4jDatasetCsv: path.join(w.tmp, 'vul4j_dataset.csv'),
      ossfuzzTaskDir: w.fs.ossfuzzTaskDir,
      ossfuzzLabelsPath: path.join(w.tmp, 'pool_labelling.jsonl'),
      ossfuzzSnapshotDir: path.join(w.fs.ossfuzzSnapshotDir, 'buggy'),
      listDir: (dir) => w.params.listings[dir] ?? fs.readdirSync(dir),
      readFile: (f) => fs.readFileSync(f, 'utf8')
    }
  }
}

When('the queue is built with seed {int}, sampling {int} FP and {int} TP', function (seed, sampleFp, sampleTp) {
  const { build } = queueArgs(this)
  this.params.queue = buildQueue({ ...build, sampleFp, sampleTp, seed })
})

When('the queue is rebuilt with seed {int}, sampling {int} FP and {int} TP', function (seed, sampleFp, sampleTp) {
  const { build } = queueArgs(this)
  this.params.queue2 = buildQueue({ ...build, sampleFp, sampleTp, seed })
})

When('the queue is rebuilt after shuffling fixture file listings', function () {
  const { build } = queueArgs(this)
  for (const dir of [this.fs.owaspFpDir, this.fs.owaspTpDir, this.fs.vul4jCaseDir, this.fs.ossfuzzTaskDir]) {
    this.params.listings[dir] = fs.readdirSync(dir).reverse()
  }
  this.params.queue2 = buildQueue({ ...build, sampleFp: 0, sampleTp: 0, seed: 42 })
})

Then('the queue has {int} items', function (n) {
  assert.equal(this.params.queue.items.length, n)
})

Then('the two queues are identical', function () {
  assert.deepEqual(this.params.queue.items, this.params.queue2.items)
  assert.deepEqual(this.params.queue.skipped, this.params.queue2.skipped)
})

Then('the queue has exactly {int} owasp item with label {string}', function (n, label) {
  const got = this.params.queue.items.filter(i => i.dataset === 'owasp' && i.label === label).length
  assert.equal(got, n)
})

Then('item {string} has dataset {string} and label {string}', function (caseId, dataset, label) {
  const item = this.params.queue.items.find(i => i.caseId === caseId)
  assert.ok(item, `missing item ${caseId}`)
  assert.equal(item.dataset, dataset)
  assert.equal(item.label, label)
})

Then('item {string} has cwe {string}', function (caseId, cwe) {
  const item = this.params.queue.items.find(i => i.caseId === caseId)
  assert.equal(String(item.cwe), cwe)
})

Then('item {string} has repo_root ending with {string}', function (caseId, suffix) {
  const item = this.params.queue.items.find(i => i.caseId === caseId)
  assert.ok(item.repoRoot.endsWith(suffix), `${item.repoRoot} should end with ${suffix}`)
})

Then('the queue reports skipped ids {string}', function (ids) {
  assert.deepEqual(this.params.queue.skipped, ids.split(', '))
})

Given('triage results:', function (table) {
  this.params.results = table.hashes().map(r => ({
    label: r.label,
    verdict: r.verdict,
    cwe: r.cwe ? Number(r.cwe) : null,
    cost: r.cost ? Number(r.cost) : 0
  }))
})

When('the metrics are computed', function () {
  this.params.metrics = computeMetrics(this.params.results)
})

Then('the FP recall is {float}', function (v) { assert.equal(this.params.metrics.fpRecall, v) })
Then('the FP precision is {float}', function (v) { assert.equal(this.params.metrics.fpPrecision, v) })
Then('the F1 is {float}', function (v) { assert.equal(this.params.metrics.f1, v) })
Then('the TP retention is {float}', function (v) { assert.equal(this.params.metrics.tpRetention, v) })
Then('the unknown rate is {float}', function (v) { assert.equal(this.params.metrics.unknownRate, v) })
Then('the total cost is {float}', function (v) {
  assert.ok(Math.abs(this.params.metrics.totalCost - v) < 1e-9)
})
Then('cwe {string} has FP recall {float}', function (cwe, v) {
  assert.equal(this.params.metrics.byCwe[cwe].fpRecall, v)
})
Then('cwe {string} has TP retention {float}', function (cwe, v) {
  assert.equal(this.params.metrics.byCwe[cwe].tpRetention, v)
})
