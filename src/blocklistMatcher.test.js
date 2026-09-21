import { test } from 'node:test'
import assert from 'assert'
import { parseBlocklist, fnmatchSubstring, matchBlocklist, tokenize } from './blocklistMatcher.js'

test('parseBlocklist strips comments and empty lines', () => {
  const { patterns } = parseBlocklist('# comment\nt3sts/\n\n  \n  fixtures/  \n')
  assert.deepEqual(patterns, ['t3sts/', 'fixtures/'])
})

test('parseBlocklist drops bare asterisk/at lines with a warning', () => {
  const { patterns, warnings } = parseBlocklist('*\n@\n*@\nt3sts/\n')
  assert.deepEqual(patterns, ['t3sts/'])
  assert.deepEqual(warnings, ['*', '@', '*@'])
})

test('parseBlocklist tolerates missing file contents', () => {
  assert.deepEqual(parseBlocklist(null).patterns, [])
  assert.deepEqual(parseBlocklist(undefined).patterns, [])
})

test('literal patterns behave as substring matches', () => {
  assert.ok(fnmatchSubstring('t3sts/', 't3sts/npmaudit/package-lock.json'))
  assert.ok(fnmatchSubstring('t3sts/', 'x/t3sts/y'))
  assert.ok(!fnmatchSubstring('t3sts/', 'package-lock.json'))
})

test('glob patterns match like cleaner.rb fnmatch', () => {
  assert.ok(fnmatchSubstring('t3sts/*.json', 't3sts/npmaudit/package-lock.json'))
  assert.ok(fnmatchSubstring('t3sts/**/*.json', 't3sts/a/b/c.json'))
  assert.ok(fnmatchSubstring('t?sts/', 't3sts/x'))
  assert.ok(!fnmatchSubstring('t3sts/*.json', 't3sts/npmaudit/package-lock.toml'))
  assert.ok(fnmatchSubstring('t3sts/[ab]*', 't3sts/beta'))
  assert.ok(!fnmatchSubstring('t3sts/[ab]*', 't3sts/gamma'))
})

test('escaped metacharacters match literally (File.fnmatch semantics)', () => {
  assert.ok(fnmatchSubstring('a\\*b', 'xa*by'))
  assert.ok(!fnmatchSubstring('a\\*b', 'xaXb'))
  assert.ok(fnmatchSubstring('a\\?b', 'xa?b'))
  assert.ok(!fnmatchSubstring('a\\?b', 'xab'))
  assert.ok(fnmatchSubstring('a\\[b\\]', 'xa[b]'))
  assert.deepEqual(tokenize('a\\*b'), [
    { type: 'literal', ch: 'a' },
    { type: 'literal', ch: '*' },
    { type: 'literal', ch: 'b' }
  ])
})

test('regex metacharacters in patterns are literal', () => {
  assert.ok(fnmatchSubstring('a.b', 'xa.by'))
  assert.ok(!fnmatchSubstring('a.b', 'xaXby'))
  assert.ok(fnmatchSubstring('pkg(1)', 'dir/pkg(1)/lock'))
  assert.ok(!fnmatchSubstring('a+b', 'aab'))
})

test('unterminated bracket is a literal bracket', () => {
  assert.ok(fnmatchSubstring('a[', 'xa[b'))
  assert.ok(!fnmatchSubstring('a[', 'xab'))
})

test('null/undefined paths never match', () => {
  assert.ok(!fnmatchSubstring('t3sts/', null))
  assert.ok(!fnmatchSubstring('t3sts/', undefined))
})

test('matchBlocklist returns the first matching pattern or null', () => {
  const patterns = ['nomatch/', 't3sts/']
  assert.equal(matchBlocklist(patterns, 't3sts/pipaudit/pyproject.toml'), 't3sts/')
  assert.equal(matchBlocklist(patterns, 'src/index.js'), null)
})
