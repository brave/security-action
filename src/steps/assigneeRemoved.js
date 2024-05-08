export default async function assigneeRemoved ({
  context,
  github,
  githubToken,
  assignees
}) {
  console.log('assignees: %o', assignees)
  const assigneesOutput = assignees.split(/\s+/).filter((str) => str !== '')
  const query = `query ($owner: String!, $name: String!, $prnumber: Int!) {
      repository(owner: $owner, name: $name) {
        pullRequest(number: $prnumber) {
          timelineItems(last: 100, itemTypes: UNLABELED_EVENT) {
            nodes {
              ... on UnlabeledEvent {
                label {
                  name
                }
                actor {
                  login
                }
              }
            }
          }
        }
      }
    }`
  const variables = {
    owner: context.repo.owner,
    name: context.repo.repo,
    prnumber: context.issue.number
  }
  const result = await github.graphql(query, variables)
  const timelineItems = result.repository.pullRequest.timelineItems
  console.log('timelineItems: %o', timelineItems)
  const removedByAssigneeEvents = timelineItems.nodes.filter(
    timelineItem => (
      timelineItem.label.name === 'needs-security-review' &&
      assigneesOutput.some((a) => timelineItem.actor.login === a)
    )
  ).length
  console.log('RemovedByAssigneeEvents: %d', removedByAssigneeEvents)
  return removedByAssigneeEvents > 0
}
