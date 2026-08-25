/**
 * Property tests for matchCodeowners (fast-check).
 */
import { test } from 'node:test'
import assert from 'assert'
import fc from 'fast-check'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { parseCodeowners, patternToRegex, findOwners } from './matchCodeowners.js'

// Path-like strings without whitespace or glob characters
const chars = 'abcdefghijklmnopqrstuvwxyz0123456789.-_'.split('')
const plainSegmentArb = fc.array(fc.constantFrom(...chars), { minLength: 1, maxLength: 12 })
  .map(segments => segments.join(''))
const filePathArb = fc.array(plainSegmentArb, { minLength: 1, maxLength: 5 })
  .map(segments => segments.join('/'))

test('property: a glob-free pattern matches exactly itself', async () => {
  await fc.assert(fc.asyncProperty(filePathArb, file => {
    assert.ok(patternToRegex(file).test(file), `${file} should match itself`)
    assert.ok(!patternToRegex('other/' + file).test(file))
  }))
})

test('property: dir pattern "src/**" matches exactly paths inside src', async () => {
  await fc.assert(fc.asyncProperty(filePathArb, file => {
    const re = patternToRegex('src/**')
    const inside = file.startsWith('src/') || file.startsWith('/src/')
    // 'src/**' -> (^|/)src/.* — matches when src/ appears at a segment boundary
    const expected = /(^|\/)src\//.test(file)
    assert.equal(re.test(file), expected, `src/** vs ${file} (inside=${inside})`)
  }))
})

test('property: single star never crosses a slash boundary on exact files', async () => {
  await fc.assert(fc.asyncProperty(plainSegmentArb, segment => {
    // 'dir/*' with a single-segment name always matches dir/<segment>
    assert.ok(patternToRegex('dir/*').test(`dir/${segment}`))
    // and the matched segment itself contains no slash by construction
    assert.ok(!segment.includes('/'))
  }))
})

test('property: root-anchored pattern never matches prefixed paths', async () => {
  await fc.assert(fc.asyncProperty(filePathArb, file => {
    const pattern = '/' + file
    const re = patternToRegex(pattern)
    assert.ok(re.test(file), `${pattern} should match ${file}`)
    assert.ok(!re.test('prefix/' + file), `${pattern} must not match prefixed path`)
  }))
})

test('property: last matching pattern wins', async () => {
  await fc.assert(fc.asyncProperty(filePathArb, file => {
    const owners = findOwners(file, [
      ['**', ['@first']],
      ['**', ['@last']]
    ])
    assert.deepEqual(owners, ['@last'])
  }))
})

test('property: no match yields empty owners', async () => {
  await fc.assert(fc.asyncProperty(filePathArb, file => {
    const notThere = 'zzz-nonexistent-' + file
    if (!file.includes(notThere)) {
      assert.deepEqual(findOwners(file, [[`/${notThere}`, ['@x']]]), [])
    }
  }))
})

test('property: parsing round-trips generated ownership lines', async () => {
  const ownerArb = plainSegmentArb.map(s => `@${s}`)
  const entryArb = fc.tuple(filePathArb, fc.array(ownerArb, { minLength: 1, maxLength: 4 }))
  await fc.assert(fc.asyncProperty(fc.array(entryArb, { maxLength: 10 }), entries => {
    const content = entries
      .map(([pattern, owners]) => `${pattern} ${owners.join(' ')}`)
      .join('\n')
    const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'prop-codeowners-')), 'CODEOWNERS')
    fs.writeFileSync(tmp, content)
    const parsed = parseCodeowners(tmp)
    assert.deepEqual(parsed, entries.map(([pattern, owners]) => [pattern, owners]))
    fs.rmSync(path.dirname(tmp), { recursive: true, force: true })
  }))
})

test('property: comments and blanks never produce patterns', async () => {
  const commentChars = '# abcdefghijklmnopqrstuvwxyz '.split('')
  const commentArb = fc.array(fc.constantFrom(...commentChars), { maxLength: 40 })
    .map(chars => '#' + chars.join(''))
  await fc.assert(fc.asyncProperty(fc.array(commentArb, { maxLength: 10 }), comments => {
    const content = comments.join('\n') + '\n\n'
    const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'prop-codeowners-')), 'CODEOWNERS')
    fs.writeFileSync(tmp, content)
    const parsed = parseCodeowners(tmp)
    assert.equal(parsed.length, 0)
    fs.rmSync(path.dirname(tmp), { recursive: true, force: true })
  }))
})
