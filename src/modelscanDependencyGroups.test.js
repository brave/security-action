import { strict as assert } from 'assert'
import modelscanDependencyGroups from './modelscanDependencyGroups.js'

console.log('Testing modelscanDependencyGroups...')

// ─────────────────────────────────────────────────────────────────────────────
// Test: no model files → no groups (modelscan not installed at all)
{
  const groups = modelscanDependencyGroups({
    changedFiles: ['src/index.js', 'README.md'],
    modelscanEnabled: 'all',
    env: {}
  })
  assert.deepStrictEqual(groups, [], 'no model files → []')
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: pickle suffixes → modelscan group only
for (const file of ['model.pkl', 'model.pickle', 'model.joblib', 'model.dill', 'model.dat', 'model.data']) {
  const groups = modelscanDependencyGroups({
    changedFiles: [file],
    modelscanEnabled: 'all',
    env: {}
  })
  assert.deepStrictEqual(groups, ['modelscan'], `${file} → ['modelscan']`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: numpy/pytorch suffixes → modelscan group only
for (const file of ['array.npy', 'weights.bin', 'weights.pt', 'weights.pth', 'model.ckpt']) {
  const groups = modelscanDependencyGroups({
    changedFiles: [file],
    modelscanEnabled: 'all',
    env: {}
  })
  assert.deepStrictEqual(groups, ['modelscan'], `${file} → ['modelscan']`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: h5 suffix → modelscan group only (h5py rides in the modelscan group)
{
  const groups = modelscanDependencyGroups({
    changedFiles: ['weights.h5'],
    modelscanEnabled: 'all',
    env: {}
  })
  assert.deepStrictEqual(groups, ['modelscan'], '.h5 → modelscan only')
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: tensorflow suffixes → both groups
for (const file of ['model.keras', 'model.pb']) {
  const groups = modelscanDependencyGroups({
    changedFiles: ['src/index.js', file],
    modelscanEnabled: 'all',
    env: {}
  })
  assert.deepStrictEqual(groups, ['modelscan', 'tensorflow'], `${file} → both groups`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: .pbtxt must not trigger tensorflow (.pb is a full-suffix match)
{
  const groups = modelscanDependencyGroups({
    changedFiles: ['graph.pbtxt'],
    modelscanEnabled: 'all',
    env: {}
  })
  assert.deepStrictEqual(groups, [], '.pbtxt → no groups')
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: suffix match is case-insensitive
{
  const groups = modelscanDependencyGroups({
    changedFiles: ['MODEL.PKL'],
    modelscanEnabled: 'all',
    env: {}
  })
  assert.deepStrictEqual(groups, ['modelscan'], 'uppercase .PKL → modelscan')
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: modelscan disabled → no groups even with model files
{
  const groups = modelscanDependencyGroups({
    changedFiles: ['model.pkl', 'model.pb'],
    modelscanEnabled: 'false',
    env: {}
  })
  assert.deepStrictEqual(groups, [], 'modelscan disabled → []')
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: scanner list excludes keras/saved_model → .keras never scanned → no groups
{
  const groups = modelscanDependencyGroups({
    changedFiles: ['model.keras'],
    modelscanEnabled: 'pickle,numpy,pytorch',
    env: {}
  })
  assert.deepStrictEqual(groups, [], 'lightweight scanners + .keras → []')
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: scanner list includes keras → both groups with .keras file
{
  const groups = modelscanDependencyGroups({
    changedFiles: ['model.keras'],
    modelscanEnabled: 'pickle,keras',
    env: {}
  })
  assert.deepStrictEqual(groups, ['modelscan', 'tensorflow'], 'keras scanner + .keras → both')
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: env var forces both groups regardless of changed files
{
  const groups = modelscanDependencyGroups({
    changedFiles: ['src/index.js'],
    modelscanEnabled: 'all',
    env: { SEC_ACTION_MODELSCAN_HEAVY: 'true' }
  })
  assert.deepStrictEqual(groups, ['modelscan', 'tensorflow'], 'env var override → both')
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: env var 'false' does not force
{
  const groups = modelscanDependencyGroups({
    changedFiles: ['src/index.js'],
    modelscanEnabled: 'all',
    env: { SEC_ACTION_MODELSCAN_HEAVY: 'false' }
  })
  assert.deepStrictEqual(groups, [], "env var 'false' → no force")
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: modelscan disabled wins over env var
{
  const groups = modelscanDependencyGroups({
    changedFiles: [],
    modelscanEnabled: 'false',
    env: { SEC_ACTION_MODELSCAN_HEAVY: 'true' }
  })
  assert.deepStrictEqual(groups, [], 'modelscan disabled beats env var')
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: empty changed files list → no groups
{
  const groups = modelscanDependencyGroups({
    changedFiles: [],
    modelscanEnabled: 'all',
    env: {}
  })
  assert.deepStrictEqual(groups, [], 'empty list → []')
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: defaults — no args → no groups, no crash
{
  const groups = modelscanDependencyGroups()
  assert.deepStrictEqual(groups, [], 'no args → []')
}

console.log('All modelscanDependencyGroups tests passed')
