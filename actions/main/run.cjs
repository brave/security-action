#!/usr/bin/env node
/**
 * Container entry point for the main security-action script.
 *
 * actions/main/action.cjs used to run through actions/github-script,
 * which always executes on the runner host even when the job specifies
 * a container. To keep the main script inside the prebuilt image (and
 * off the host network), action.yml now pipes the composite inputs as
 * JSON on stdin and runs this thin CJS entry with the baked node:
 *
 *   node run.cjs <<'INPUTS_JSON_EOF'
 *   { ...inputs... }
 *   INPUTS_JSON_EOF
 *
 * It rebuilds the github-script injected surface via src/shim.js
 * (github / context / core), requires action.cjs and awaits it with
 * the same argument shape github-script used.
 */

const fs = require('fs')
const path = require('path')

// ACTION_PATH is the action repo root (github.action_path/../..);
// fall back to two levels up from this file, which lands on the same
// directory when run from a checkout.
const actionPath = process.env.ACTION_PATH || path.resolve(__dirname, '..', '..')
const debugEnabled = String(process.env.DEBUG || '') === 'true'

function debug (msg) {
  if (debugEnabled) console.log(`[debug] ${msg}`)
}

function readStdinJson () {
  try {
    const raw = fs.readFileSync(0, 'utf-8').trim()
    return raw ? JSON.parse(raw) : {}
  } catch (err) {
    debug(`failed to read inputs from stdin: ${err.message}`)
    return {}
  }
}

async function main () {
  const inputs = readStdinJson()

  // action.cjs takes its token from inputs.github_token; the shim's
  // Octokit reads env.GITHUB_TOKEN. Bridge the two so both surfaces
  // authenticate without action.yml having to export the secret.
  if (inputs.github_token && !process.env.GITHUB_TOKEN) {
    process.env.GITHUB_TOKEN = inputs.github_token
  }

  const { buildGithubScriptShim } = await import(
    path.join(actionPath, 'src', 'shim.js')
  )
  const { github, context, core } = await buildGithubScriptShim({ actionPath })

  if (inputs.github_token) core.setSecret(inputs.github_token)

  const script = require(path.join(actionPath, 'actions', 'main', 'action.cjs'))
  await script({ github, context, inputs, actionPath, core, debug })
}

main().catch((err) => {
  console.error(err && err.stack ? err.stack : err)
  process.exitCode = 1
})
