/**
 * Property tests for sendSlackMessage.messageToBlocks (fast-check).
 */
import { test } from 'node:test'
import assert from 'assert'
import fc from 'fast-check'
import { messageToBlocks, splitMessageForSlack } from './sendSlackMessage.js'

const paragraphArb = fc.array(
  fc.array(fc.constantFrom(...'abcdefghij '.split('')), { minLength: 1, maxLength: 12 })
    .map(chars => chars.join('').trim())
    .filter(p => p.length > 0),
  { minLength: 1, maxLength: 80 }
)

test('property: block count never exceeds fifty', async () => {
  await fc.assert(fc.asyncProperty(paragraphArb, async paragraphs => {
    const blocks = await messageToBlocks(paragraphs.join('\n\n'))
    assert.ok(blocks.length <= 50, `got ${blocks.length} blocks`)
  }), { numRuns: 25 })
})

test('property: the final paragraph always survives the cap', async () => {
  await fc.assert(fc.asyncProperty(paragraphArb, async paragraphs => {
    const last = paragraphs[paragraphs.length - 1]
    const blocks = await messageToBlocks(paragraphs.join('\n\n'))
    assert.ok(
      JSON.stringify(blocks).includes(last),
      `last paragraph "${last}" lost`
    )
  }), { numRuns: 25 })
})

test('property: the cap marker appears only when truncation happened', async () => {
  await fc.assert(fc.asyncProperty(paragraphArb, async paragraphs => {
    const blocks = await messageToBlocks(paragraphs.join('\n\n'))
    const hasMarker = blocks.some(b => JSON.stringify(b).includes('...and more'))
    // The marker is only added when the raw markdown produced > 50 blocks.
    // With up to 80 paragraphs, both outcomes are valid — but the marker
    // must imply exactly 50 blocks.
    if (hasMarker) assert.equal(blocks.length, 50)
  }), { numRuns: 25 })
})

test('property: chunks split at line boundaries and rejoin exactly', async () => {
  const bulletArb = fc.array(
    fc.array(fc.constantFrom(...'abcdefghijk '.split('')), { minLength: 1, maxLength: 60 })
      .map(chars => `- ${chars.join('').trimEnd() || 'x'}`),
    { minLength: 1, maxLength: 300 }
  )
  await fc.assert(fc.property(bulletArb, bullets => {
    const body = bullets.join('\n')
    const chunks = splitMessageForSlack(body)
    assert.equal(chunks.join('\n'), body, 'chunks must rejoin to the original')
    // Chunk boundaries never fall inside a line: every chunk starts
    // with "- " (or is the whole body when it is a single chunk).
    for (const chunk of chunks) {
      if (chunks.length === 1) continue
      assert.ok(chunk.startsWith('- '), 'chunk starts mid-line')
      assert.ok(chunk.length <= 2900, `chunk too long: ${chunk.length}`)
    }
  }), { numRuns: 100 })
})
