import { strict as assert } from 'assert'
import modelscanNeedsTensorflow from './modelscanNeedsTensorflow.js'

console.log('Testing modelscanNeedsTensorflow...')

// ─────────────────────────────────────────────────────────────────────────────
// Test: default — no model files in PR → no tensorflow
{
  const result = modelscanNeedsTensorflow({
    changedFiles: ['src/index.js', 'README.md'],
    modelscanEnabled: 'all',
    env: {}
  })
  assert.strictEqual(result, false, 'no model files → false')
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: .keras file present → tensorflow needed
{
  const result = modelscanNeedsTensorflow({
    changedFiles: ['src/index.js', 'models/foo.keras'],
    modelscanEnabled: 'all',
    env: {}
  })
  assert.strictEqual(result, true, '.keras → true')
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: .pb file present (saved_model) → tensorflow needed
{
  const result = modelscanNeedsTensorflow({
    changedFiles: ['model.pb', 'src/index.js'],
    modelscanEnabled: 'all',
    env: {}
  })
  assert.strictEqual(result, true, '.pb → true')
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: .h5 only → no tensorflow (h5py is a base dependency)
{
  const result = modelscanNeedsTensorflow({
    changedFiles: ['weights.h5'],
    modelscanEnabled: 'all',
    env: {}
  })
  assert.strictEqual(result, false, '.h5 → false (h5py in base deps)')
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: .pbtxt must not match .pb suffix
{
  const result = modelscanNeedsTensorflow({
    changedFiles: ['graph.pbtxt'],
    modelscanEnabled: 'all',
    env: {}
  })
  assert.strictEqual(result, false, '.pbtxt → false')
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: suffix match is case-insensitive
{
  const result = modelscanNeedsTensorflow({
    changedFiles: ['MODEL.KERAS'],
    modelscanEnabled: 'all',
    env: {}
  })
  assert.strictEqual(result, true, 'uppercase .KERAS → true')
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: modelscan disabled → no tensorflow even with model files
{
  const result = modelscanNeedsTensorflow({
    changedFiles: ['model.keras'],
    modelscanEnabled: 'false',
    env: {}
  })
  assert.strictEqual(result, false, 'modelscan disabled → false')
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: scanner list excludes keras/saved_model → no tensorflow
{
  const result = modelscanNeedsTensorflow({
    changedFiles: ['model.keras'],
    modelscanEnabled: 'pickle,numpy,pytorch',
    env: {}
  })
  assert.strictEqual(result, false, 'lightweight scanners only → false')
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: scanner list includes keras → tensorflow needed with .keras file
{
  const result = modelscanNeedsTensorflow({
    changedFiles: ['model.keras'],
    modelscanEnabled: 'keras',
    env: {}
  })
  assert.strictEqual(result, true, 'keras scanner + .keras → true')
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: scanner list includes saved_model → tensorflow needed with .pb file
{
  const result = modelscanNeedsTensorflow({
    changedFiles: ['model.pb'],
    modelscanEnabled: 'pickle,saved_model',
    env: {}
  })
  assert.strictEqual(result, true, 'saved_model scanner + .pb → true')
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: scanner list includes keras but no model file → no tensorflow
{
  const result = modelscanNeedsTensorflow({
    changedFiles: ['src/index.js'],
    modelscanEnabled: 'keras',
    env: {}
  })
  assert.strictEqual(result, false, 'keras scanner but no model file → false')
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: env var forces tensorflow regardless of changed files
{
  const result = modelscanNeedsTensorflow({
    changedFiles: ['src/index.js'],
    modelscanEnabled: 'all',
    env: { SEC_ACTION_MODELSCAN_HEAVY: 'true' }
  })
  assert.strictEqual(result, true, 'env var override → true')
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: env var set to 'false' does not force
{
  const result = modelscanNeedsTensorflow({
    changedFiles: ['src/index.js'],
    modelscanEnabled: 'all',
    env: { SEC_ACTION_MODELSCAN_HEAVY: 'false' }
  })
  assert.strictEqual(result, false, "env var 'false' → no force")
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: modelscan disabled wins over env var (no modelscan run at all)
{
  const result = modelscanNeedsTensorflow({
    changedFiles: [],
    modelscanEnabled: 'false',
    env: { SEC_ACTION_MODELSCAN_HEAVY: 'true' }
  })
  assert.strictEqual(result, false, 'modelscan disabled beats env var')
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: empty changed files list → false
{
  const result = modelscanNeedsTensorflow({
    changedFiles: [],
    modelscanEnabled: 'all',
    env: {}
  })
  assert.strictEqual(result, false, 'empty list → false')
}

// ─────────────────────────────────────────────────────────────────────────────
// Test: defaults — no args → false, no crash
{
  const result = modelscanNeedsTensorflow()
  assert.strictEqual(result, false, 'no args → false')
}

console.log('All modelscanNeedsTensorflow tests passed')
