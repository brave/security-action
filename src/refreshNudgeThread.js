// Keep an existing nudge thread in sync with reality.
//
// When some of a repo's alerts get dismissed or fixed but
// others remain, the thread would otherwise keep showing
// the resolved ones and a stale count. This re-renders the
// remaining alerts and edits the messages in place.
//
// chat.update is a revision, not a delivery, so refreshing a
// thread never re-notifies the maintainers tagged in it.
//
// If nothing remains, the whole thread (replies then parent)
// is deleted so the channel does not keep an empty shell.
// Human replies cannot be removed by this bot, so a thread
// with discussion is kept and only the bot's messages are
// cleared.

import {
  buildRepoMessage,
  buildParentBlocks,
  parentCcLine
} from './dependabotNudge.js'
import { messageToBlocks } from './sendSlackMessage.js'
import { findRepoParent, postAlertReply } from './nudgeThread.js'
import {
  chunkNudgeMessage,
  fetchThreadReplies,
  isBotOwned,
  pace
} from './slackUtils.js'

// Compare rendered content, ignoring the block_id values
// Slack assigns on post, so unchanged threads are left
// alone instead of being rewritten on every run.
function blocksSignature (blocks) {
  return (blocks || [])
    .map(b => `${b.type}:${b.text?.text || ''}`)
    .join('\n')
}

// Tear down a thread whose alerts are all gone. Bot replies
// are deleted first; the parent goes last so Slack does not
// leave replies behind a "message deleted" placeholder. When
// the thread has conversation this bot cannot delete (human
// or other-app replies), the parent stays and is zeroed
// instead so the discussion is not orphaned.
async function deleteThread ({
  web, channelId, parent, replies, repoFullName, debug
}) {
  const others = (replies || []).filter(m => m.ts !== parent.ts)
  const conversation =
    others.filter(m => !isBotOwned(m, parent.bot_id))
  const managed =
    others.filter(m => isBotOwned(m, parent.bot_id))
  const keepParent = conversation.length > 0

  if (debug) {
    console.log(
      `refresh: would clear thread ${parent.ts} ` +
      `(${managed.length} bot repl(ies), ` +
      `${conversation.length} to keep)`
    )
    return { touched: managed.length, ok: true }
  }

  let touched = 0
  for (const m of managed) {
    try {
      if (touched > 0) await pace()
      await web.chat.delete({ channel: channelId, ts: m.ts })
      touched++
    } catch (err) {
      console.error(
        `refresh: failed to delete ts=${m.ts}: ${err.message}`
      )
      // Leave the rest (and the parent) in place so nothing
      // is orphaned; the next run retries the thread.
      return { touched, ok: false }
    }
  }

  try {
    // Pace the parent write off the last deletion so it is
    // not rejected as a duplicate.
    if (touched > 0) await pace()
    if (keepParent) {
      await web.chat.update({
        channel: channelId,
        ts: parent.ts,
        text: 'dependabot alert',
        blocks: await buildParentBlocks({
          repo: repoFullName, total: 0, critical: 0
        })
      })
    } else {
      await web.chat.delete({ channel: channelId, ts: parent.ts })
    }
    touched++
  } catch (err) {
    const what = keepParent ? 'update' : 'delete'
    console.error(
      `refresh: failed to ${what} parent ts=${parent.ts}: ` +
      err.message
    )
    return { touched, ok: false }
  }

  return { touched, ok: true }
}

// Refresh one repo's thread against its current alerts.
//
// @param {object} opts
// @param {object} opts.web           - Slack WebClient
// @param {string} opts.channelId     - Slack channel ID
// @param {object[]} opts.messages    - Channel history
// @param {string} opts.repoFullName  - 'org/repo'
// @param {object[]} opts.alerts      - Qualifying open alerts
// @param {boolean} [opts.debug]
// @returns {Promise<{touched: number, ok: boolean}>}
//   touched - messages written; ok - false when any write
//   failed, so callers do not mark the thread complete on
//   top of stale content.
export default async function refreshNudgeThread ({
  web,
  channelId,
  messages = [],
  repoFullName,
  alerts = [],
  debug = false
}) {
  debug = debug === 'true' || debug === true

  const parent = findRepoParent(messages, repoFullName)
  if (!parent) {
    if (debug) {
      console.log(
        `refresh: no nudge thread found for ${repoFullName}`
      )
    }
    return { touched: 0, ok: true }
  }

  const thread = await fetchThreadReplies(
    web, channelId, parent.ts
  )

  const { message, total, critical } =
    buildRepoMessage({ alerts })
  const chunks = chunkNudgeMessage(message)

  // No alerts left: tear the thread down, or zero the parent
  // when its discussion has to stay.
  if (chunks.length === 0) {
    return deleteThread({
      web, channelId, parent, replies: thread, repoFullName, debug
    })
  }

  // Only the detail replies are rewritten. A legacy cc reply
  // is handled after the parent update below: it carries the
  // mentions, so it must survive until the parent shows
  // them. Human replies in the thread are ignored the same
  // way.
  const details = thread.filter(m =>
    m.ts !== parent.ts &&
    m.metadata?.event_payload?.kind === 'alerts'
  )
  const ccReply = thread.find(m =>
    m.ts !== parent.ts &&
    m.metadata?.event_payload?.kind === 'cc'
  )
  // The parent keeps its cc until the cc reply lands: reuse
  // it when the reply is missing so the retry does not strip
  // the mentions from the summary.
  const cc = ccReply?.text || parentCcLine(parent.blocks)

  if (debug) {
    console.log(
      `refresh: ${repoFullName} -> ${total} alert(s), ` +
      `${chunks.length} chunk(s) over ${details.length} ` +
      'existing repl(ies)'
    )
    return { touched: chunks.length + details.length, ok: true }
  }

  let touched = 0
  let ok = true

  // Rewrite the detail replies that are still needed.
  for (let i = 0; i < chunks.length && i < details.length; i++) {
    try {
      const blocks = await messageToBlocks(chunks[i])

      // Nothing changed for this reply: leave it as it is.
      if (
        blocksSignature(blocks) ===
        blocksSignature(details[i].blocks)
      ) {
        continue
      }

      await web.chat.update({
        channel: channelId,
        ts: details[i].ts,
        text: 'dependabot alert',
        blocks
      })
      touched++
      await pace()
    } catch (err) {
      ok = false
      console.error(
        `refresh: failed to update ts=${details[i].ts}: ` +
        err.message
      )
    }
  }

  // More chunks than replies means alerts were added since
  // the thread was created; append the remainder so nothing
  // is hidden behind a count that claims otherwise.
  for (let i = details.length; i < chunks.length; i++) {
    try {
      await postAlertReply(
        web, channelId, parent.ts, chunks[i], repoFullName
      )
      touched++
      await pace()
    } catch (err) {
      ok = false
      console.error(
        `refresh: failed to append chunk ${i} to ` +
        `${repoFullName}: ${err.message}`
      )
    }
  }

  // Drop the replies that are no longer needed because
  // alerts were resolved. If this was the last findings
  // message, the whole thread is already handled above.
  for (let i = chunks.length; i < details.length; i++) {
    try {
      await web.chat.delete({
        channel: channelId, ts: details[i].ts
      })
      touched++
      await pace()
    } catch (err) {
      ok = false
      console.error(
        `refresh: failed to delete ts=${details[i].ts}: ` +
        err.message
      )
    }
  }

  // Correct the count on the thread parent and keep the
  // maintainers visible in the channel overview. Editing
  // does not re-notify.
  let parentOk = true
  try {
    const parentBlocks = await buildParentBlocks({
      repo: repoFullName, total, critical, cc
    })
    if (blocksSignature(parentBlocks) !== blocksSignature(parent.blocks)) {
      await web.chat.update({
        channel: channelId,
        ts: parent.ts,
        text: 'dependabot alert',
        blocks: parentBlocks
      })
      touched++
    }
  } catch (err) {
    parentOk = false
    ok = false
    console.error(
      `refresh: failed to update parent ts=${parent.ts}: ` +
      err.message
    )
  }

  // Threads posted before the parent carried the cc inline
  // end with a 'cc' reply. It duplicates the parent's
  // mentions now, so drop it once the parent is known to
  // show them; keep it when the parent write failed so the
  // mentions are never lost.
  if (ccReply && cc && parentOk) {
    try {
      await web.chat.delete({
        channel: channelId, ts: ccReply.ts
      })
      touched++
    } catch (err) {
      ok = false
      console.error(
        `refresh: failed to delete cc reply ts=${ccReply.ts}: ` +
        err.message
      )
    }
  }

  return { touched, ok }
}
