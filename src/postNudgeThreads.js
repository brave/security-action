// Post one Slack thread per repo with qualifying Dependabot
// alerts, extracted from the composite action adapter so the
// orchestration is unit-testable without spinning GitHub
// Actions.
//
// One thread per repo: the parent carries the counts, the
// replies carry the findings, and the maintainers are tagged
// in the final cc reply. Slack has no way to post a reply
// without notifying, and a mention added by editing a
// message notifies nobody, so the thread keeps to a single
// ping: the parent is posted and the findings are laid down
// without any mentions, the parent is then edited to show
// the cc inline (edits never notify), and the cc reply is
// posted last as the one notification.
//
// The cc reply doubles as the completion marker for the
// week: it is only posted once every other write of the
// thread is known to have succeeded, so a partial failure
// stays recoverable on the next run instead of being
// permanently marked complete.

import { buildParentBlocks } from './dependabotNudge.js'
import refreshNudgeThread from './refreshNudgeThread.js'
import {
  findRepoParent,
  postAlertReply,
  postCcReply,
  PARENT_EVENT_TYPE
} from './nudgeThread.js'
import {
  chunkNudgeMessage,
  fetchMessages,
  pace
} from './slackUtils.js'

// Post (or refresh) the weekly nudge threads.
//
// @param {object} opts
// @param {object} opts.web        - Slack WebClient
// @param {string} opts.channelId  - Slack channel ID
// @param {string} opts.org        - GitHub org name
// @param {object[]} opts.messages - Channel history
// @param {object[]} opts.nudges   - dependabotNudge() output
// @param {string} opts.weekId     - ISO week the nudge is for
// @param {number} [opts.lookbackDays] - History window for
//   the duplicate-parent re-check
// @param {boolean} [opts.debug]
export default async function postNudgeThreads ({
  web,
  channelId,
  org,
  messages = [],
  nudges = [],
  weekId,
  lookbackDays = 7,
  debug = false
}) {
  for (const { repo, message, cc, total, critical, alerts } of nudges) {
    try {
      let parent = findRepoParent(messages, repo, weekId)

      if (!parent) {
        // A concurrent run may have created the parent after
        // this run's history snapshot: re-check before posting
        // so the maintainers are not pinged from two threads.
        const fresh = await fetchMessages(
          web, channelId, lookbackDays
        )
        parent = findRepoParent(fresh, repo, weekId)
        if (parent && debug) {
          console.log(
            `adopted parent ${parent.ts} for ${repo} ` +
            'from a concurrent run'
          )
        }
      }

      // Existing thread: bring it in line with the current
      // alerts. The refresh rewrites the findings, corrects
      // the counts, and completes the thread by posting the
      // cc reply when an earlier run failed to deliver it;
      // editing never re-notifies, so refreshing every run
      // is free.
      if (parent) {
        const { ok } = await refreshNudgeThread({
          web,
          channelId,
          messages: [parent],
          repoFullName: repo,
          alerts,
          providedCc: cc,
          debug
        })
        if (!ok) {
          // Leave the thread as-is: the next run retries.
          console.error(
            `refresh failed for ${repo}; leaving thread ` +
            `${parent.ts} for retry`
          )
        }
        continue
      }

      if (debug) { console.log(`creating thread for ${repo} ${weekId}`) }

      // The parent is posted as the summary and nothing else:
      // no mentions, so the post notifies nobody. The mentions
      // are added later by editing, which never re-notifies.
      const parentResult = await web.chat.postMessage({
        channel: channelId,
        username: 'dependabot',
        text: 'dependabot alert',
        link_names: true,
        unfurl_links: true,
        unfurl_media: true,
        blocks: await buildParentBlocks({
          repo, total, critical
        }),
        metadata: {
          event_type: PARENT_EVENT_TYPE,
          event_payload: { org, repo, weekId }
        }
      })
      const parentTs = parentResult?.ts
      if (!parentTs) {
        console.error(`failed to obtain thread ts for ${repo}; skipping replies`)
        continue
      }
      await pace()

      // One reply per alert; none of them mention anyone, so
      // the thread stays at a single notification.
      for (const chunk of chunkNudgeMessage(message)) {
        await postAlertReply(web, channelId, parentTs, chunk, repo)
        await pace()
      }

      // The parent is finalized before the cc reply: the
      // mentions this edit adds notify nobody, but the thread
      // must not be marked complete while this write can
      // still fail.
      try {
        await web.chat.update({
          channel: channelId,
          ts: parentTs,
          text: 'dependabot alert',
          blocks: await buildParentBlocks({
            repo, total, critical, cc
          })
        })
      } catch (err) {
        console.error(
          `failed to add maintainers to parent for ${repo}: ${err.message}`
        )
        continue
      }
      await pace()

      // Sent as raw text rather than blocks: the cc carries
      // the mentions, so its post is the thread's single
      // notification and its completion marker.
      await postCcReply(web, channelId, parentTs, cc, repo)
      await pace()
    } catch (error) {
      console.error(`failed to nudge ${repo}: ${error.message}`)
      if (debug) { console.log(error) }
    }
  }
}
