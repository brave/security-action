/**
 * Tests for matchCodeowners module
 */

import matchCodeowners, { parseCodeowners, patternToRegex, findOwners, findCodeownersPath } from './matchCodeowners.js'
import { strict as assert } from 'assert'

// Mock fs for testing
import fs from 'fs'

// Test parseCodeowners
console.log('Testing parseCodeowners...')
const mockCodeownersContent = `# This is a comment
* @global-owner

/assets/ @acme/assets-team
*.js @javascript-team
docs/ @myorg/docs-team @bob
/src/**/*.test.js @test-team
`
const originalReadFileSync = fs.readFileSync
const originalExistsSync = fs.existsSync

fs.readFileSync = (path, encoding) => {
  if (path === 'test-codeowners') {
    return mockCodeownersContent
  }
  return originalReadFileSync(path, encoding)
}

fs.existsSync = (path) => {
  if (path === 'test-codeowners') {
    return true
  }
  return originalExistsSync(path)
}

const patterns = parseCodeowners('test-codeowners')
assert.equal(patterns.length, 5, 'Should parse 5 patterns')
assert.deepEqual(patterns[0], ['*', ['@global-owner']], 'First pattern should be global owner')
assert.deepEqual(patterns[1], ['/assets/', ['@acme/assets-team']], 'Second pattern should be assets team')
assert.deepEqual(patterns[3], ['docs/', ['@myorg/docs-team', '@bob']], 'Fourth pattern should have multiple owners')
console.log('✓ parseCodeowners works correctly')

// Test patternToRegex
console.log('\nTesting patternToRegex...')

// Test wildcard patterns
let regex = patternToRegex('*.js')
assert.equal(regex.test('file.js'), true, '*.js should match file.js')
assert.equal(regex.test('path/to/file.js'), true, '*.js should match path/to/file.js')
assert.equal(regex.test('file.ts'), false, '*.js should not match file.ts')

// Test directory patterns
regex = patternToRegex('/assets/')
assert.equal(regex.test('assets/file.txt'), true, '/assets/ should match assets/file.txt')
assert.equal(regex.test('other/assets/file.txt'), false, '/assets/ should not match other/assets/file.txt')

// Test double wildcard
regex = patternToRegex('/src/**/*.test.js')
assert.equal(regex.test('src/foo/bar/baz.test.js'), true, 'Should match nested test files')
assert.equal(regex.test('src/foo.test.js'), true, 'Should match direct test files')
assert.equal(regex.test('other/src/foo.test.js'), false, 'Should not match if not from root')

console.log('✓ patternToRegex works correctly')

// Test findOwners
console.log('\nTesting findOwners...')

// Last matching pattern wins (most specific)
const testPatterns = [
  ['*', ['@global-owner']],
  ['*.js', ['@javascript-team']],
  ['/src/**/*.test.js', ['@test-team']]
]

let owners = findOwners('README.md', testPatterns)
assert.deepEqual(owners, ['@global-owner'], 'README.md should match global owner')

owners = findOwners('script.js', testPatterns)
assert.deepEqual(owners, ['@javascript-team'], 'script.js should match javascript team')

owners = findOwners('src/foo/bar.test.js', testPatterns)
assert.deepEqual(owners, ['@test-team'], 'Test file should match test team (most specific)')

console.log('✓ findOwners works correctly')

// Test findCodeownersPath
console.log('\nTesting findCodeownersPath...')

// Mock different locations
fs.existsSync = (path) => {
  if (path === '.github/CODEOWNERS') {
    return true
  }
  return false
}

let foundPath = findCodeownersPath('.')
assert.equal(foundPath, '.github/CODEOWNERS', 'Should find .github/CODEOWNERS first')

// Test fallback to root
fs.existsSync = (path) => {
  if (path === 'CODEOWNERS') {
    return true
  }
  return false
}

foundPath = findCodeownersPath('.')
assert.equal(foundPath, 'CODEOWNERS', 'Should fallback to root CODEOWNERS')

// Test fallback to docs
fs.existsSync = (path) => {
  if (path === 'docs/CODEOWNERS') {
    return true
  }
  return false
}

foundPath = findCodeownersPath('.')
assert.equal(foundPath, 'docs/CODEOWNERS', 'Should fallback to docs/CODEOWNERS')

// Test not found
fs.existsSync = () => false
foundPath = findCodeownersPath('.')
assert.equal(foundPath, null, 'Should return null if not found')

console.log('✓ findCodeownersPath works correctly')

// Test team vs individual detection
console.log('\nTesting team vs individual detection...')

const testFiles = ['file1.js', 'file2.md', 'file3.txt']
fs.readFileSync = (path) => {
  if (path === 'test-codeowners-2') {
    return `*.js @acme/frontend-team @github/security
*.md @alice
*.txt @bob`
  }
  return originalReadFileSync(path)
}

fs.existsSync = (path) => path === 'test-codeowners-2'

const result = matchCodeowners({
  changedFiles: testFiles,
  codeownersPath: 'test-codeowners-2',
  debug: false
})

assert.equal(result.stats.teams, 2, 'Should detect 2 teams')
assert.equal(result.stats.individuals, 2, 'Should detect 2 individuals')
assert.ok(result.stats.teamsList.includes('@acme/frontend-team'), 'Should include @acme/frontend-team')
assert.ok(result.stats.teamsList.includes('@github/security'), 'Should include @github/security')
assert.ok(result.stats.individualsList.includes('@alice'), 'Should include @alice')
assert.ok(result.stats.individualsList.includes('@bob'), 'Should include @bob')

console.log('✓ Team vs individual detection works correctly')

// Restore mocks
fs.readFileSync = originalReadFileSync
fs.existsSync = originalExistsSync

console.log('\n✅ All tests passed!')
