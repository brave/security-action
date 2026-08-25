/**
 * Property tests for modelscanDependencyGroups (fast-check).
 */
import { test } from 'node:test'
import assert from 'assert'
import fc from 'fast-check'
import modelscanDependencyGroups from './modelscanDependencyGroups.js'

const MODEL_SUFFIXES = ['.pkl', '.pickle', '.joblib', '.dill', '.dat', '.data', '.npy', '.bin', '.pt', '.pth', '.ckpt', '.h5']
const TF_SUFFIXES = ['.keras', '.pb']
const ALL_SUFFIXES = [...MODEL_SUFFIXES, ...TF_SUFFIXES]

const fileChars = 'abcdefghijklmnopqrstuvwxyz0123456789-_/.'.split('')
const normalFileArb = fc.array(fc.constantFrom(...fileChars), { maxLength: 30 })
  .map(chars => chars.join(''))
  .filter(f => !ALL_SUFFIXES.some(s => f.toLowerCase().endsWith(s)))

const modelFileArb = normalFileArb.map(f => f + fc.sample(fc.constantFrom(...MODEL_SUFFIXES), 1)[0])
const tfFileArb = normalFileArb.map(f => f + fc.sample(fc.constantFrom(...TF_SUFFIXES), 1)[0])

const enabledArb = fc.constantFrom('all', 'false', '', 'pickle', 'keras', 'saved_model', 'pickle,keras', 'PICKLE,numpy', ' pickle , pytorch ')
const envArb = fc.option(fc.constantFrom('1', 'true', 'false', '', 'yes'), { nil: undefined })

const groupsFor = (changedFiles, modelscanEnabled, env) => modelscanDependencyGroups({
  changedFiles,
  modelscanEnabled,
  env: env || {}
})

test('property: result only contains known groups', async () => {
  await fc.assert(fc.asyncProperty(
    fc.array(fc.oneof(normalFileArb, modelFileArb, tfFileArb), { maxLength: 10 }),
    enabledArb,
    envArb,
    (files, enabled, env) => {
      const groups = groupsFor(files, enabled, env)
      assert.ok(groups.every(g => g === 'modelscan' || g === 'tensorflow'))
    }
  ))
})

test('property: tensorflow never appears without modelscan', async () => {
  await fc.assert(fc.asyncProperty(
    fc.array(fc.oneof(normalFileArb, modelFileArb, tfFileArb), { maxLength: 10 }),
    enabledArb,
    envArb,
    (files, enabled, env) => {
      const groups = groupsFor(files, enabled, env)
      if (groups.includes('tensorflow')) {
        assert.ok(groups.includes('modelscan'))
        assert.equal(groups.indexOf('modelscan'), 0)
      }
    }
  ))
})

test('property: no model files and no heavy env yields no groups', async () => {
  await fc.assert(fc.asyncProperty(
    fc.array(normalFileArb, { maxLength: 10 }),
    enabledArb,
    (files, enabled) => {
      assert.deepEqual(groupsFor(files, enabled, {}), [])
    }
  ))
})

test('property: heavy env forces both groups unless modelscan is disabled', async () => {
  await fc.assert(fc.asyncProperty(
    fc.array(fc.oneof(normalFileArb, modelFileArb), { maxLength: 10 }),
    fc.constantFrom('all', 'pickle', 'keras', 'saved_model', '', 'anything'),
    fc.constantFrom('1', 'true', 'yes'),
    (files, enabled, heavy) => {
      assert.deepEqual(groupsFor(files, enabled, { SEC_ACTION_MODELSCAN_HEAVY: heavy }), ['modelscan', 'tensorflow'])
    }
  ))
})

test('property: modelscan "false" yields no groups even for model files and heavy env', async () => {
  await fc.assert(fc.asyncProperty(
    fc.array(fc.oneof(modelFileArb, tfFileArb), { maxLength: 10 }),
    fc.constantFrom('1', 'true', 'yes'),
    (files, heavy) => {
      assert.deepEqual(groupsFor(files, 'false', { SEC_ACTION_MODELSCAN_HEAVY: heavy }), [])
    }
  ))
})

test('property: suffix detection is case-insensitive', async () => {
  await fc.assert(fc.asyncProperty(
    fc.constantFrom(...MODEL_SUFFIXES, ...TF_SUFFIXES),
    normalFileArb,
    (suffix, prefix) => {
      const lower = groupsFor([prefix + suffix], 'all', {})
      const upper = groupsFor([prefix + suffix.toUpperCase()], 'all', {})
      assert.deepEqual(upper, lower)
    }
  ))
})

test('property: any model-suffixed file yields at least the modelscan group', async () => {
  await fc.assert(fc.asyncProperty(
    modelFileArb,
    fc.constantFrom('all', 'pickle', 'keras', 'saved_model'),
    (file, enabled) => {
      const groups = groupsFor([file], enabled, {})
      assert.ok(groups.includes('modelscan'), `${file} with ${enabled} -> ${groups}`)
    }
  ))
})
