// Post one Slack thread per repo with qualifying Dependabot
// alerts, extracted from the composite action adapter so the
// orchestration is unit-testable without spinning GitHub
// Actions.
//
// One thread per repo: the parent carries the counts, the
// replies carry the findings, and the maintainers are tagged
// in the very last reply. Slack has no way to post a reply
// without notifying, and a mention added by editing a
// message notifies nobody, so mentioning once at the end is
// what keeps it to a single ping.
//
// The cc reply doubles as the completion marker for the
// week: it is only posted once every other write of the
// thread is known to have succeeded, so a partial failure
// stays recoverable on the next run instead of being
// permanently marked complete.

import sendSlackMessage from './sendSlackMessage.js'
import {
  buildParentText,
  buildParentBlocks
} from './dependabotNudge.js'
import refreshNudgeThread, {
  findRepoParent,
  PARENT_EVENT_TYPE
} from './refreshNudgeThread.js'
import {
  chunkNudgeMessage,
  fetchMessages,
  fetchThreadReplies,
  nudgeThreadProgress,
  pace
} from './slackUtils.js'

// Post (or finish, or refresh) the weekly nudge threads.
//
// @param {object} opts
// @param {object} opts.web        - Slack WebClient
// @param {string} opts.channelId  - Slack channel ID
// @param {string} opts.channel    - Channel name, for posts
// @param {string} opts.token      - Slack bot token
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
  channel,
  token,
  org,
  messages = [],
  nudges = [],
  weekId,
  lookbackDays = 7,
  debug = false
}) {
  const slack = {
    channel,
    channelId,
    token,
    username: 'dependabot',
    _web: web
  }

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

      let parentTs = parent?.ts
      let skipChunks = false

      // The cc reply is the completion marker. A parent
      // with some replies may still be a partial failure
      // (findings posted, cc never sent). Refresh rewrites
      // those findings from the current alert list so we
      // do not resume by chunk count after alerts change.
      if (parentTs && parent.reply_count > 0) {
        const thread = await fetchThreadReplies(
          web, channelId, parentTs
        )
        const progress = nudgeThreadProgress(thread, parentTs)
        if (progress.complete) {
          if (debug) {
            console.log(
              'already posted this week, skipping ' +
              `${repo} ${weekId} (thread ${parentTs})`
            )
          }
          continue
        }
        const { ok } = await refreshNudgeThread({
          web,
          channelId,
          messages: [parent],
          repoFullName: repo,
          alerts,
          debug
        })
        if (!ok) {
          // Never mark a half-written thread complete: the
          // next run refreshes and finishes it.
          console.error(
            `refresh failed for ${repo}; leaving thread ` +
            `${parentTs} incomplete for retry`
          )
          continue
        }
        skipChunks = true
        if (alerts.length === 0) continue
        await pace()
      }

      if (!parentTs) {
        if (debug) { console.log(`creating thread for ${repo} ${weekId}`) }

        // The parent is the summary and nothing else: the
        // findings go in the replies below it. Mentions are
        // added later via chat.update so they show in the
        // channel without a second notification.
        const parentResult = await sendSlackMessage({
          ...slack,
          debug,
          message: buildParentText({ repo, total, critical }),
          eventType: PARENT_EVENT_TYPE,
          eventPayload: { org, repo, weekId }
        })
        parentTs = parentResult?.ts
        await pace()
      } else {
        if (debug) { console.log(`finishing thread ${parentTs} for ${repo} ${weekId}`) }
      }

      if (!parentTs) {
        console.error(`failed to obtain thread ts for ${repo}; skipping replies`)
        continue
      }

      if (!skipChunks) {
        for (const chunk of chunkNudgeMessage(message)) {
          await sendSlackMessage({
            ...slack,
            debug,
            message: chunk,
            threadTs: parentTs,
            eventPayload: { repo, kind: 'alerts' }
          })
          await pace()
        }
      }

      // The parent is finalized before the cc reply: the
      // mentions it adds notify nobody, and the thread must
      // not be marked complete while this write can still
      // fail.
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

      // Sent as `text` rather than `message`: the
      // markdown-to-blocks conversion escapes `<@U123>`
      // mentions, which silently drops the notification.
      await sendSlackMessage({
        ...slack,
        debug,
        text: cc,
        threadTs: parentTs,
        eventPayload: { repo, kind: 'cc' }
      })
      await pace()
    } catch (error) {
      console.error(`failed to nudge ${repo}: ${error.message}`)
      if (debug) { console.log(error) }
    }
  }
}
