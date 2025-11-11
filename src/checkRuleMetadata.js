import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

function checkRuleFile (filePath, basePath = process.cwd()) {
  const errors = []
  const content = fs.readFileSync(filePath, 'utf8')
  const relativePath = path.relative(basePath, filePath)

  try {
    const doc = yaml.load(content)

    if (!doc.rules || !Array.isArray(doc.rules)) {
      errors.push(`${relativePath}: No rules array found`)
      return errors
    }

    doc.rules.forEach((rule, index) => {
      const ruleId = rule.id || `rule-${index}`

      // Check for author in metadata
      if (!rule.metadata || !rule.metadata.author) {
        errors.push(`${relativePath} [${ruleId}]: Missing metadata.author`)
      }

      // Check for source in metadata
      if (!rule.metadata || !rule.metadata.source) {
        errors.push(`${relativePath} [${ruleId}]: Missing metadata.source`)
      } else {
        // Verify source matches the expected GitHub URL format
        const expectedSource = `https://github.com/brave/security-action/blob/main/${relativePath}`
        if (rule.metadata.source !== expectedSource) {
          errors.push(`${relativePath} [${ruleId}]: metadata.source is "${rule.metadata.source}" but should be "${expectedSource}"`)
        }
      }

      // Check for category in metadata
      if (!rule.metadata || !rule.metadata.category) {
        errors.push(`${relativePath} [${ruleId}]: Missing metadata.category`)
      } else if (!['security', 'correctness', 'privacy'].includes(rule.metadata.category)) {
        errors.push(`${relativePath} [${ruleId}]: metadata.category must be either "security", "correctness", or "privacy", found "${rule.metadata.category}"`)
      }
    })
  } catch (e) {
    errors.push(`${relativePath}: Failed to parse YAML: ${e.message}`)
  }

  return errors
}

function findYamlFiles (dir) {
  const files = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...findYamlFiles(fullPath))
    } else if (entry.isFile() && (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml')) && !entry.name.endsWith('.test.yaml')) {
      files.push(fullPath)
    }
  }

  return files
}

export default async function checkRuleMetadata ({
  dirs = [
    'assets/opengrep_rules/services',
    'assets/opengrep_rules/client'
  ],
  basePath = process.cwd(),
  exitOnError = true
}) {
  const allErrors = []

  for (const dir of dirs) {
    const fullPath = path.isAbsolute(dir) ? dir : path.join(basePath, dir)
    if (fs.existsSync(fullPath)) {
      const files = findYamlFiles(fullPath)
      for (const file of files) {
        const errors = checkRuleFile(file, basePath)
        allErrors.push(...errors)
      }
    } else {
      console.error(`Directory not found: ${fullPath}`)
      if (exitOnError) {
        process.exit(1)
      }
      return { success: false, errors: [`Directory not found: ${fullPath}`] }
    }
  }

  if (allErrors.length > 0) {
    console.error('\n❌ Metadata validation failed:\n')
    allErrors.forEach(err => console.error(`  ${err}`))
    console.error(`\nTotal errors: ${allErrors.length}`)
    if (exitOnError) {
      process.exit(1)
    }
    return { success: false, errors: allErrors }
  } else {
    console.log('✅ All rule files have correct metadata')
    if (exitOnError) {
      process.exit(0)
    }
    return { success: true, errors: [] }
  }
}

// CLI mode
if (import.meta.url === `file://${process.argv[1]}`) {
  checkRuleMetadata({})
}
