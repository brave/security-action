/**
 * Tests for dependabotNudge message builders
 */
import { strict as assert } from 'assert'
import {
  buildRepoMessage,
  buildParentText,
  buildCcLine,
  buildParentBlocks
} from './dependabotNudge.js'

function makeAlert (n, severity = 'high') {
  return {
    number: n,
    html_url: `https://github.com/brave/foo/security/dependabot/${n}`,
    severity,
    dependency: { package: { name: `pkg-${n}` }, scope: 'runtime' },
    security_advisory: {
      summary: `Vulnerability ${n}`,
      description: `# Title\n\nBad things in pkg-${n}.\n`,
      severity,
      cve_id: `CVE-2026-000${n}`,
      ghsa_id: `GHSA-000${n}`
    },
    security_vulnerability: {
      first_patched_version: { identifier: '1.2.3' }
    }
  }
}

console.log('Testing dependabotNudge builders...')

{
  const text = buildParentText({
    repo: 'brave/foo', total: 4, critical: 0
  })
  assert.equal(
    text,
    '[brave/foo](https://github.com/brave/foo) has `4` open Dependabot issues'
  )
  assert.ok(
    !text.includes('critical'),
    'Should omit the critical clause when none are critical'
  )
}
console.log('  buildParentText: summary without criticals')

{
  const text = buildParentText({
    repo: 'brave/foo', total: 4, critical: 2
  })
  assert.equal(
    text,
    '[brave/foo](https://github.com/brave/foo) has `4` open Dependabot issues (**2 critical**)'
  )
}
console.log('  buildParentText: appends critical count when present')

{
  const { message, total, critical } = buildRepoMessage({
    alerts: [makeAlert(1), makeAlert(2, 'critical')]
  })
  assert.equal(total, 2)
  assert.equal(critical, 1)
  assert.ok(message.includes('pkg-1'), 'Should list the first finding')
  assert.ok(message.includes('pkg-2'), 'Should list the second finding')
  assert.ok(
    message.includes('Handle this alert at'),
    'Should keep the per-alert handle link from the original format'
  )
  assert.ok(
    !message.includes('open Dependabot'),
    'Findings must not repeat the parent summary'
  )
  assert.ok(
    !message.includes('cc '),
    'Findings must not include the maintainer cc line'
  )
}
console.log('  buildRepoMessage: findings only, original alert shape')

{
  const { critical } = buildRepoMessage({
    alerts: [{
      ...makeAlert(1, 'critical'),
      severity: undefined
    }]
  })
  assert.equal(
    critical, 1,
    'Should read severity from the advisory when top-level is missing'
  )
}
console.log('  buildRepoMessage: advisory severity for criticals')

assert.equal(
  buildCcLine(['<@U1>', '<@U2>']),
  'cc <@U1> <@U2>'
)
assert.ok(
  buildCcLine([], ['yan']).startsWith('cc @yan'),
  'Should fall back to the default contact'
)
console.log('  buildCcLine: tags maintainers')

{
  const blocks = await buildParentBlocks({
    repo: 'brave/foo',
    total: 3,
    critical: 1,
    cc: 'cc <@U1>'
  })
  const sections = blocks.filter(b => b.type === 'section')
  assert.equal(
    sections.length, 1,
    'The cc must join the summary, not add a section'
  )
  assert.ok(
    sections[0].text.text.includes('open Dependabot issues'),
    'Summary stays on the line'
  )
  assert.ok(
    sections[0].text.text.includes('(*1 critical*)'),
    'Critical count stays on the line'
  )
  assert.ok(
    sections[0].text.text.endsWith(' (cc <@U1>)'),
    'cc is inline at the end of the summary line'
  )
  assert.ok(
    !JSON.stringify(blocks).includes('pkg-'),
    'Parent blocks must not include finding details'
  )
}
console.log('  buildParentBlocks: summary with inline cc, no findings')

console.log('\n✅ All dependabotNudge builder tests passed!')
