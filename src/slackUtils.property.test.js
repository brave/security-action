/**
 * Property tests for slackUtils (fast-check).
 */
import { test } from 'node:test'
import assert from 'assert'
import fc from 'fast-check'
import { chunkNudgeMessage, isBotOwned } from './slackUtils.js'

const SEPARATOR = '\n\n---\n\n'

const alertArb = fc.integer({ min: 1, max: 500 }).map(n => `alert number ${n}\n- detail ${n}`)
const messageArb = fc.array(alertArb, { minLength: 0, maxLength: 20 })
  .map(alerts => alerts.join(SEPARATOR))

test('property: chunking never loses alert text', async () => {
  await fc.assert(fc.asyncProperty(messageArb, fc.integer({ min: 1, max: 5 }), (message, max) => {
    const chunks = chunkNudgeMessage(message, max)
    const rejoined = chunks.join(SEPARATOR)
    for (const alert of message.split(SEPARATOR).filter(p => p.trim().length > 0)) {
      assert.ok(
        rejoined.includes(alert) || chunks.some(c => c.includes(alert)),
        `alert "${alert.slice(0, 20)}" lost`
      )
    }
  }))
})

test('property: chunk count is the ceiling of parts over max', async () => {
  await fc.assert(fc.asyncProperty(
    fc.array(alertArb, { minLength: 1, maxLength: 30 }),
    fc.integer({ min: 1, max: 10 }),
    (alerts, max) => {
      const message = alerts.join(SEPARATOR)
      const chunks = chunkNudgeMessage(message, max)
      assert.equal(chunks.length, Math.ceil(alerts.length / max))
    }
  ))
})

test('property: every chunk holds at most max alerts', async () => {
  await fc.assert(fc.asyncProperty(messageArb, fc.integer({ min: 1, max: 5 }), (message, max) => {
    for (const chunk of chunkNudgeMessage(message, max)) {
      const parts = chunk.split(SEPARATOR).filter(p => p.trim().length > 0)
      assert.ok(parts.length <= max, `chunk holds ${parts.length} > ${max}`)
    }
  }))
})

test('property: empty and separator-only messages yield no chunks', async () => {
  await fc.assert(fc.asyncProperty(fc.integer({ min: 0, max: 10 }), n => {
    const message = n > 0 ? Array(n).fill('   ').join(SEPARATOR) : ''
    assert.deepEqual(chunkNudgeMessage(message, 1), [])
  }))
})

const botIdArb = fc.constantFrom('B123', 'B999', null)

test('property: with a bot id, ownership is exactly bot_id equality', async () => {
  await fc.assert(fc.asyncProperty(botIdArb, fc.option(fc.constantFrom('B123', 'B999', 'other'), { nil: undefined }), (botId, messageBotId) => {
    const message = { bot_id: messageBotId, metadata: { event_type: 'x' } }
    if (botId) {
      assert.equal(isBotOwned(message, botId), messageBotId === botId)
    }
  }))
})

test('property: without a bot id, ownership requires nudge metadata', async () => {
  await fc.assert(fc.asyncProperty(
    fc.option(fc.constantFrom('alerts', 'cc'), { nil: undefined }),
    fc.option(fc.constantFrom('findings'), { nil: undefined }),
    (eventType, kind) => {
      const metadata = {}
      if (eventType) metadata.event_type = eventType
      if (kind) metadata.event_payload = { kind }
      const message = { bot_id: 'B123', metadata }
      assert.equal(isBotOwned(message, null), Boolean(eventType || kind))
    }
  ))
})
