export default async function checkDismissed ({
  context,
  github,
  assignees
}) {
  try {
    // Get PR comments
    const { data: comments } = await github.rest.issues.listComments({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number
    })

    console.log(`Found ${comments.length} comments on PR #${context.issue.number}`)

    // Check if any assignee has dismissed the PR
    const assigneesArray = assignees.split(/\s+/).filter((str) => str !== '')
    const dismissedByAssignee = assigneesArray.some(assignee => 
      comments.some(comment => 
        comment.user.login === 'github-actions[bot]' && 
        comment.body.includes(`✅ Security alerts dismissed by @${assignee}`)
      )
    )

    console.log('Dismissed by assignee:', dismissedByAssignee)
    return dismissedByAssignee
  } catch (error) {
    console.error('Error checking dismissal status:', error)
    return false
  }
}