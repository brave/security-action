import assert from 'node:assert'
import { test } from 'node:test'
import { splitMessageForSlack } from './sendSlackMessage.js'

test('splitMessageForSlack: a short message stays a single chunk', () => {
  const body = Array.from({ length: 30 }, (_, i) => `- bullet ${i}`).join('\n')
  const chunks = splitMessageForSlack(body)
  assert.equal(chunks.length, 1)
  assert.equal(chunks[0], body)
})

test('splitMessageForSlack: a long message splits at line boundaries', () => {
  const lines = Array.from({ length: 80 }, (_, i) => '- a'.repeat(15))
  const body = lines.join('\n')
  const chunks = splitMessageForSlack(body)
  assert.ok(chunks.length > 1)
  // Rejoining the chunks reproduces the original message exactly.
  assert.equal(chunks.join('\n'), body)
  for (const chunk of chunks) {
    assert.ok(chunks.length === 1 || chunk.length <= 2900)
    assert.ok(chunk.split('\n').length <= 40)
    assert.ok(!chunk.startsWith('\n') && !chunk.endsWith('\n'))
  }
})

test('splitMessageForSlack: no chunk exceeds the character limit', () => {
  const body = Array.from({ length: 200 }, (_, i) => `line ${i}`).join('\n')
  for (const chunk of splitMessageForSlack(body)) {
    assert.ok(chunk.length <= 2900, `chunk too long: ${chunk.length}`)
  }
})

test('splitMessageForSlack: a single oversized line travels whole', () => {
  const giant = 'x'.repeat(5000)
  const chunks = splitMessageForSlack(giant)
  assert.equal(chunks.length, 1)
  assert.equal(chunks[0], giant)
})

test('splitMessageForSlack: trailing newline does not create an empty chunk', () => {
  const chunks = splitMessageForSlack('a\nb\n')
  assert.equal(chunks.join('\n'), 'a\nb\n')
})

test('splitMessageForSlack: lines are never cut mid-line', () => {
  const body = Array.from({ length: 120 }, (_, i) => `- item number ${i}`).join('\n')
  const chunks = splitMessageForSlack(body)
  assert.equal(chunks.join('\n'), body)
  for (const chunk of chunks) {
    for (const line of chunk.split('\n')) {
      assert.ok(line.startsWith('- item') || line === '', line)
    }
  }
})
