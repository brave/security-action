/**
 * Brave web-search tool for the agentic triage harness.
 *
 * Lets the agent look up external facts (library docs, CVE context,
 * framework behavior) that the repository alone cannot answer.
 *
 * search({query, count}) -> numbered text block for the agent, or
 * 'no results'. HTTP failures throw Error('Brave API <status> — <body>').
 */
export function createBraveSearch ({ apiKey, fetchImpl = fetch, baseUrl = 'https://api.search.brave.com/res/v1/web/search' }) {
  if (!apiKey) throw new Error('Brave search not configured: missing API key')

  async function search ({ query, count = 5 }) {
    const params = new URLSearchParams({ q: query, count: String(count) })
    const res = await fetchImpl(`${baseUrl}?${params}`, {
      headers: {
        Accept: 'application/json',
        'X-Subscription-Token': apiKey
      }
    })
    const body = await res.text()
    if (!res.ok) throw new Error(`Brave API ${res.status} — ${body}`)
    let parsed
    try {
      parsed = JSON.parse(body)
    } catch {
      return 'no results'
    }
    const results = parsed?.web?.results ?? []
    if (results.length === 0) return 'no results'
    return results
      .map((r, i) => `${i + 1}. ${r.title ?? ''}\n   ${r.url ?? ''}\n   ${r.description ?? ''}\n   Age: ${r.age ?? 'unknown'}`)
      .join('\n')
  }

  return { search }
}
