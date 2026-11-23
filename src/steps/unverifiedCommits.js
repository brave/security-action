import { guardWrite } from '../githubWriteGuard.js'

const LABEL = 'unverified-commits'

// Comment and label lifecycle for unverified commits on a PR.
//
// Returns one of:
// - 'UNVERIFIED-CHANGED' — unverified commits and the notice changed (label added)
// - 'UNVERIFIED'         — unverified commits, notice already current (no writes)
// - 'VERIFIED'           — every commit verified (stale notice + label removed)
//
// The step owns the whole label lifecycle: it adds the label when new
// unverified commits appear and removes it once every commit verifies
// (e.g. after a force-push of signed commits), where the label used to
// linger (brave-core#41566). Label writes go through guardWrite so fork
// PRs with a read-only token skip with a warning instead of failing.
export default async function unverifiedCommits ({
  github,
  githubToken,
  context,
  core
}) {
  const commits = await github.rest.pulls.listCommits({
    pull_number: context.issue.number,
    owner: context.repo.owner,
    repo: context.repo.repo
  })
  const previousCommentsQuery = `query ($owner: String!, $name: String!, $prnumber: Int!) {
        repository(owner: $owner, name: $name) {
          pullRequest(number: $prnumber) {
            comments(last: 50) {
              nodes {
                id
                author {
                  login
                }
                body
              }
            }
          }
        }
      }`
  const deleteMutation = `mutation($comment:ID!) {
        deleteIssueComment(input: {id:$comment}) {
          clientMutationId
        }
      }`
  const previousComments = await github.graphql(previousCommentsQuery, {
    owner: context.repo.owner,
    name: context.repo.repo,
    prnumber: context.issue.number
  })
  const commentPrefix = 'The following commits were not [verified](https://github.com/brave/handbook/blob/master/development/commit-and-tag-signing.md):\n'
  const actionPreviousComments = previousComments.repository.pullRequest.comments.nodes.filter(
    c => c.author.login === 'github-actions' && c.body.startsWith(commentPrefix)
  )
  const unverified = commits.data.filter(c => c.commit.verification.verified !== true)
  if (unverified.length) {
    const commitList = unverified.map(c => `${c.sha} (${c.commit.verification.reason})`).join('\n')
    const body = commentPrefix + commitList
    let commentExists = false
    for (const comment of actionPreviousComments) {
      if (comment.body === body) {
        console.log('Good comment found:', comment)
        commentExists = true
      } else {
        console.log('Deleting', comment)
        await github.graphql(deleteMutation, { comment: comment.id })
      }
    }
    if (!commentExists) {
      console.log('Creating new comment')
      await github.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
        body
      })
      await guardWrite(core, 'add unverified-commits label', () =>
        github.rest.issues.addLabels({
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: context.issue.number,
          labels: [LABEL]
        }))
      return 'UNVERIFIED-CHANGED' // A new comment was created
    }
    return 'UNVERIFIED'
  } else {
    console.log('Commits verified')
    for (const comment of actionPreviousComments) {
      console.log('Deleting', comment)
      await github.graphql(deleteMutation, { comment: comment.id })
    }
    const labels = await github.rest.issues.listLabelsOnIssue({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number
    })
    if (labels.data.some(label => label.name === LABEL)) {
      await guardWrite(core, 'remove unverified-commits label', () =>
        github.rest.issues.removeLabel({
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: context.issue.number,
          name: LABEL
        }))
    }
    return 'VERIFIED'
  }
}
