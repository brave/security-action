/**
 * Property tests for cleanup/delete parsers (fast-check).
 */
import { test } from 'node:test'
import assert from 'assert'
import fc from 'fast-check'
import {
  parseCcUserIds,
  parsePrUrl,
  strikethroughText
} from './cleanupSecurityActionMessages.js'
import { extractRepoFromMessage } from './deleteSlackMessages.js'

const idChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('')
const slackIdArb = fc.array(fc.constantFrom(...idChars), { minLength: 1, maxLength: 10 })
  .map(chars => chars.join(''))

test('property: every parsed cc id appears mentioned after the marker', async () => {
  await fc.assert(fc.asyncProperty(fc.array(slackIdArb, { maxLength: 6 }), ids => {
    const text = `prefix text /cc ${ids.map(id => `<@${id}>`).join(' ')} trailing`
    const parsed = parseCcUserIds(text)
    assert.deepEqual(parsed, ids)
    for (const id of parsed) {
      assert.ok(text.includes(`<@${id}>`))
    }
  }))
})

test('property: ids mentioned before the marker are never returned', async () => {
  await fc.assert(fc.asyncProperty(slackIdArb, slackIdArb, (before, after) => {
    const text = `<@${before}> said something /cc <@${after}>`
    const parsed = parseCcUserIds(text)
    assert.deepEqual(parsed, [after])
  }))
})

test('property: text without the marker yields no ids', async () => {
  await fc.assert(fc.asyncProperty(
    fc.array(fc.constantFrom(...'abc XYZ <@> 123 /c /ccx'.split(' ')), { maxLength: 10 }),
    words => {
      const text = words.join(' ')
      if (!text.includes('/cc ')) {
        assert.deepEqual(parseCcUserIds(text), [])
      }
    }
  ))
})

const ownerArb = fc.array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')), { minLength: 1, maxLength: 12 }).map(c => c.join(''))
const repoArb = fc.array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-'.split('')), { minLength: 1, maxLength: 12 }).map(c => c.join(''))
const numberArb = fc.integer({ min: 1, max: 999999 })

test('property: PR urls round-trip through parsePrUrl', async () => {
  await fc.assert(fc.asyncProperty(ownerArb, repoArb, numberArb, (owner, repo, number) => {
    const url = `https://github.com/${owner}/${repo}/pull/${number}`
    const parsed = parsePrUrl(url)
    assert.deepEqual(parsed, { owner, repo, number })
  }))
})

test('property: non-pull urls never parse', async () => {
  await fc.assert(fc.asyncProperty(ownerArb, repoArb, numberArb, fc.constantFrom('issues', 'commits', 'tree', 'wiki'), (owner, repo, number, kind) => {
    const url = `https://github.com/${owner}/${repo}/${kind}/${number}`
    assert.equal(parsePrUrl(url), null)
  }))
})

test('property: strikethrough preserves the line structure', async () => {
  const lineArb = fc.array(fc.constantFrom(...'ab cde fghi jkl '.split('')), { minLength: 0, maxLength: 20 })
    .map(chars => chars.join(''))
  const textArb = fc.array(lineArb, { minLength: 1, maxLength: 10 }).map(lines => lines.join('\n'))
  await fc.assert(fc.asyncProperty(textArb, text => {
    const struck = strikethroughText(text)
    assert.equal(struck.split('\n').length, text.split('\n').length)
    for (const [original, line] of text.split('\n').map((l, i) => [l, struck.split('\n')[i]])) {
      if (original.trim()) {
        assert.ok(line.startsWith('~') && line.endsWith('~'), `${line} not wrapped`)
        assert.equal(line.slice(1, -1), original)
      }
    }
  }))
})

test('property: extracted repos come from metadata or a github url', async () => {
  await fc.assert(fc.asyncProperty(ownerArb, repoArb, (owner, repo) => {
    const fromMetadata = extractRepoFromMessage({
      metadata: { event_payload: { repo: `${owner}/${repo}` } }
    })
    assert.equal(fromMetadata, `${owner}/${repo}`)

    const fromUrl = extractRepoFromMessage({
      text: `look at https://github.com/${owner}/${repo}/pull/1 now`
    })
    assert.equal(fromUrl, `${owner}/${repo}`)
  }))
})

test('property: messages without repos or urls extract nothing', async () => {
  const plainArb = fc.array(fc.constantFrom(...'word words some/other text here 123 '.split(' ')), { maxLength: 10 })
  await fc.assert(fc.asyncProperty(plainArb, words => {
    const text = words.join(' ')
    if (!/github\.com\//.test(text)) {
      assert.equal(extractRepoFromMessage({ text }), null)
    }
  }))
})
