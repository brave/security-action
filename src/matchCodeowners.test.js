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

# Asset files
/assets/ @acme/assets-team
*.js @javascript-team
# Documentation
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
assert.deepEqual(patterns[0], ['*', ['@global-owner'], 'This is a comment'], 'First pattern should have comment')
assert.deepEqual(patterns[1], ['/assets/', ['@acme/assets-team'], 'Asset files'], 'Second pattern should have Asset files comment')
assert.deepEqual(patterns[2], ['*.js', ['@javascript-team'], 'Asset files'], 'Third pattern should inherit Asset files comment')
assert.deepEqual(patterns[3], ['docs/', ['@myorg/docs-team', '@bob'], 'Documentation'], 'Fourth pattern should have Documentation comment')
assert.deepEqual(patterns[4], ['/src/**/*.test.js', ['@test-team'], null], 'Fifth pattern should have no comment after blank line')
console.log('✓ parseCodeowners works correctly with comments')

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
  ['*', ['@global-owner'], 'Global files'],
  ['*.js', ['@javascript-team'], 'JavaScript files'],
  ['/src/**/*.test.js', ['@test-team'], null]
]

let findResult = findOwners('README.md', testPatterns)
assert.deepEqual(findResult.owners, ['@global-owner'], 'README.md should match global owner')
assert.equal(findResult.comment, 'Global files', 'README.md should have Global files comment')

findResult = findOwners('script.js', testPatterns)
assert.deepEqual(findResult.owners, ['@javascript-team'], 'script.js should match javascript team')
assert.equal(findResult.comment, 'JavaScript files', 'script.js should have JavaScript files comment')

findResult = findOwners('src/foo/bar.test.js', testPatterns)
assert.deepEqual(findResult.owners, ['@test-team'], 'Test file should match test team (most specific)')
assert.equal(findResult.comment, null, 'Test file should have no comment')

console.log('✓ findOwners works correctly with comments')

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
    return `# Frontend files
*.js @acme/frontend-team @github/security

# Documentation files
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

// Test comment groups
console.log('\nTesting comment groups...')
assert.ok(result.commentGroups, 'Should have commentGroups')
assert.ok(result.commentGroups['Frontend files'], 'Should have "Frontend files" comment group')
assert.ok(result.commentGroups['Documentation files'], 'Should have "Documentation files" comment group')
assert.deepEqual(result.commentGroups['Frontend files']['@acme/frontend-team'], ['file1.js'], 'Frontend team should have file1.js')
assert.deepEqual(result.commentGroups['Frontend files']['@github/security'], ['file1.js'], 'Security team should have file1.js')
assert.deepEqual(result.commentGroups['Documentation files']['@alice'], ['file2.md'], 'Alice should have file2.md')
assert.deepEqual(result.commentGroups['Documentation files']['@bob'], ['file3.txt'], 'Bob should have file3.txt')

console.log('✓ Comment groups work correctly')

// Restore mocks
fs.readFileSync = originalReadFileSync
fs.existsSync = originalExistsSync

console.log('\n✅ All tests passed!')
