// Shared identity and write helpers for the weekly Dependabot
// nudge threads. Both the posting path (postNudgeThreads.js)
// and the refresh path (refreshNudgeThread.js) build threads
// through these, so the metadata contract and the reply shape
// have a single owner.

import { messageToBlocks } from './sendSlackMessage.js'

export const PARENT_EVENT_TYPE = 'dependabot-nudge-repo-parent'
export const ALERTS_EVENT_TYPE = 'dependabot-nudge-alerts'
export const CC_EVENT_TYPE = 'dependabot-nudge-cc'

// Find the newest nudge parent for a repo among messages
// already fetched from the channel. When weekId is given,
// only that week's parent matches.
export function findRepoParent (messages, repoFullName, weekId = null) {
  return messages
    .filter(m =>
      m.metadata?.event_type === PARENT_EVENT_TYPE &&
      m.metadata?.event_payload?.repo === repoFullName &&
      (weekId === null ||
        m.metadata?.event_payload?.weekId === weekId))
    .sort((a, b) => parseFloat(b.ts) - parseFloat(a.ts))[0]
}

// Render one findings chunk into Slack blocks. Dev-dependency
// entries (their chunk carries the ' (dev)' marker) render as
// context blocks — small grey text — so a dev alert is visually
// distinct from a runtime one at a glance. Used by both the
// posting path and the refresh path so a rewritten reply keeps
// the exact style it was first posted with.
export async function nudgeReplyBlocks (chunk) {
  const blocks = await messageToBlocks(chunk)
  if (!chunk.includes('(dev)')) return blocks
  return blocks.map(block => ({
    type: 'context',
    elements: [{ type: 'mrkdwn', text: block.text?.text || '' }]
  }))
}

// Post one findings chunk as a thread reply. Used by both the
// posting path and the refresh path so an appended reply is
// shaped exactly like one from the original run.
export async function postAlertReply (
  web, channelId, parentTs, chunk, repoFullName
) {
  return web.chat.postMessage({
    channel: channelId,
    thread_ts: parentTs,
    username: 'dependabot',
    text: 'dependabot alert',
    link_names: true,
    unfurl_links: true,
    unfurl_media: true,
    blocks: await nudgeReplyBlocks(chunk),
    metadata: {
      event_type: ALERTS_EVENT_TYPE,
      event_payload: { repo: repoFullName, kind: 'alerts' }
    }
  })
}

// Post the maintainer cc as the thread's final reply. The cc
// is sent as raw mrkdwn text rather than through the
// markdown-to-blocks conversion, which escapes '<@U123>'
// mentions and silently drops the notification. The reply is
// the thread's single notification and doubles as its
// completion marker, so it only lands once every other write
// is known to have succeeded.
export async function postCcReply (
  web, channelId, parentTs, cc, repoFullName
) {
  return web.chat.postMessage({
    channel: channelId,
    thread_ts: parentTs,
    username: 'dependabot',
    text: cc,
    link_names: true,
    unfurl_links: true,
    unfurl_media: true,
    blocks: [{
      type: 'section',
      text: { type: 'mrkdwn', text: cc }
    }],
    metadata: {
      event_type: CC_EVENT_TYPE,
      event_payload: { repo: repoFullName, kind: 'cc' }
    }
  })
}
