// Post one Slack thread per repo with qualifying Dependabot
// alerts, extracted from the composite action adapter so the
// orchestration is unit-testable without spinning GitHub
// Actions.
//
// One thread per repo: the parent carries the counts and the
// maintainer mentions inline, and each alert gets its own
// reply. Posting the parent is the thread's single
// notification: mentions in a posted message notify, mentions
// added later by editing do not, and the replies never carry
// mentions at all.

import { buildParentBlocks } from './dependabotNudge.js'
import refreshNudgeThread from './refreshNudgeThread.js'
import {
  findRepoParent,
  postAlertReply,
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
      // the counts, and drops the legacy cc reply; editing
      // never re-notifies, so refreshing every run is free.
      if (parent) {
        const { ok } = await refreshNudgeThread({
          web,
          channelId,
          messages: [parent],
          repoFullName: repo,
          alerts,
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

      // The parent is posted with the mentions already in
      // place: this post is the one notification the thread
      // sends. The blocks are built directly rather than from
      // markdown so the <@U123> mention pills survive
      // unescaped.
      const parentResult = await web.chat.postMessage({
        channel: channelId,
        username: 'dependabot',
        text: 'dependabot alert',
        link_names: true,
        unfurl_links: true,
        unfurl_media: true,
        blocks: await buildParentBlocks({
          repo, total, critical, cc
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
    } catch (error) {
      console.error(`failed to nudge ${repo}: ${error.message}`)
      if (debug) { console.log(error) }
    }
  }
}
