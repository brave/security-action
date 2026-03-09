import {
  findChannelId,
  fetchMessages,
  deleteMessages
} from './slackUtils.js'

// Extract the repo full name from a Slack message.
// Prefers metadata.event_payload.repo, falls back to
// matching a github.com org/repo URL in the message.
function extractRepoFromMessage (m) {
  const payloadRepo = m.metadata?.event_payload?.repo
  if (payloadRepo) return payloadRepo

  const textContent = [
    m.text || '',
    ...(m.blocks || []).map(
      b => b.text?.text || ''
    ),
    ...(m.attachments || []).flatMap(
      a => (a.blocks || []).map(
        b => b.text?.text || ''
      )
    )
  ].join(' ')

  // Match org/repo from a github.com URL to avoid
  // false positives on arbitrary word/word patterns.
  const urlMatch = textContent.match(
    /github\.com\/([a-zA-Z0-9_-]+\/[a-zA-Z0-9._-]+)/
  )
  if (urlMatch) return urlMatch[1]

  return null
}

// Helper: create a WebClient, resolve channel, and
// fetch messages. Shared by both exported functions
// to avoid creating duplicate clients/fetches.
async function prepareSlackContext (
  token, channel, lookbackDays
) {
  const { WebClient } = await import('@slack/web-api')
  const web = new WebClient(token)
  const channelId = await findChannelId(web, channel)
  const messages = await fetchMessages(
    web, channelId, lookbackDays
  )
  return { web, channelId, messages }
}

// List unique repo names that have Slack messages from
// a given username within the lookback window.
//
// @param {object} options
// @param {string} options.token       - Slack bot token
// @param {string} options.channel     - Channel name
// @param {string} options.username    - Bot username
// @param {boolean} [options.debug]
// @param {number} [options.lookbackDays] - Default: 8
// @returns {Promise<string[]>} Repo full names
export async function listSlackMessageRepos ({
  token = null,
  channel = null,
  username = null,
  debug = false,
  lookbackDays = 8
}) {
  if (!token || !channel || !username) {
    throw new Error(
      'token, channel, and username are required!'
    )
  }

  debug = debug === 'true' || debug === true

  const { messages } = await prepareSlackContext(
    token, channel, lookbackDays
  )

  const repos = new Set()
  for (const m of messages) {
    if (m.username !== username) continue

    const repo = extractRepoFromMessage(m)
    if (repo) repos.add(repo)
  }

  if (debug) {
    console.log(
      'listSlackMessageRepos: found repos: ' +
      Array.from(repos).join(', ')
    )
  }

  return Array.from(repos)
}

// Delete Slack messages from a channel posted by a
// given username whose repo matches one of the
// provided names.
//
// @param {object} options
// @param {string} options.token       - Slack bot token
// @param {string} options.channel     - Channel name
// @param {string} options.username    - Bot username
// @param {string[]} options.repos     - Repo full names
// @param {boolean} [options.debug]
// @param {number} [options.lookbackDays] - Default: 8
// @returns {Promise<number>} Number deleted
export default async function deleteSlackMessages ({
  token = null,
  channel = null,
  username = null,
  repos = [],
  debug = false,
  lookbackDays = 8
}) {
  if (!token) throw new Error('token is required!')
  if (!channel) {
    throw new Error('channel is required!')
  }
  if (!username) {
    throw new Error('username is required!')
  }

  if (!repos || repos.length === 0) return 0

  debug = debug === 'true' || debug === true

  const { web, channelId, messages } =
    await prepareSlackContext(
      token, channel, lookbackDays
    )

  const toDelete = messages.filter(m => {
    if (m.username !== username) return false

    const payloadRepo =
      m.metadata?.event_payload?.repo
    if (payloadRepo) {
      return repos.includes(payloadRepo)
    }

    const textContent = [
      m.text || '',
      ...(m.blocks || []).map(
        b => b.text?.text || ''
      ),
      ...(m.attachments || []).flatMap(
        a => (a.blocks || []).map(
          b => b.text?.text || ''
        )
      )
    ].join(' ')

    return repos.some(
      repo => textContent.includes(repo)
    )
  })

  if (debug) {
    console.log(
      `deleteSlackMessages: found ` +
      `${toDelete.length} message(s) to delete ` +
      `for repos: ${repos.join(', ')}`
    )
  }

  return deleteMessages(
    web, channelId, toDelete, debug
  )
}
