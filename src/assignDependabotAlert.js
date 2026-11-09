// Assign GitHub users to a single Dependabot alert via the
// assignees PATCH endpoint, retrying without users GitHub
// refuses to assign. The endpoint validates the whole assignees
// array at once, so a single login without repo access (422
// "User X is not permitted to be assigned to this alert")
// leaves the alert unassigned and every retry fails the same
// way. Drop the refused login and retry with the rest; never
// PATCH an empty array, because that would clear any existing
// assignees on the alert.

export const UNPERMITTED_RE =
  /User (.+?) is not permitted to be assigned to this alert/i

export default async function assignDependabotAlert ({
  github,
  owner,
  repo,
  alertNumber,
  assignees,
  headers
}) {
  let current = [...assignees]
  const dropped = []
  while (current.length > 0) {
    try {
      await github.request(
        'PATCH /repos/{owner}/{repo}/dependabot/alerts/{alert_number}',
        {
          owner,
          repo,
          alert_number: alertNumber,
          assignees: current,
          headers
        }
      )
      return { assigned: current, dropped }
    } catch (err) {
      const login = UNPERMITTED_RE.exec(err.message || '')?.[1]
      // Only retry when the error names a login we actually sent;
      // anything else is a real failure for the caller to log.
      if (!login || !current.includes(login)) throw err
      current = current.filter(a => a !== login)
      dropped.push(login)
    }
  }
  return { assigned: [], dropped }
}
