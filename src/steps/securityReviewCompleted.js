/**
 * Detects if the needs-security-review label was removed by an assignee
 * on the current workflow run (not just historically).
 */
export default async function securityReviewCompleted ({
  context,
  github,
  assignees
}) {
  // Only relevant for pull_request events with label activity
  if (context.eventName !== 'pull_request') {
    return false
  }

  // Check if this is an unlabeled event for needs-security-review
  const payload = context.payload
  if (
    payload.action !== 'unlabeled' ||
    payload.label?.name !== 'needs-security-review'
  ) {
    return false
  }

  // Check if the actor is one of the security assignees
  const assigneesOutput = assignees
    .split(/\s+/)
    .filter((str) => str !== '')
    .map((a) => a.toLowerCase())
  const actor = payload.sender?.login?.toLowerCase()

  if (!actor) {
    return false
  }

  const isAssignee = assigneesOutput.includes(actor)
  console.log(
    `securityReviewCompleted: label=${payload.label?.name}, actor=${actor}, isAssignee=${isAssignee}`
  )

  return isAssignee
}
