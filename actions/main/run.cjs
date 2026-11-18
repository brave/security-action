#!/usr/bin/env node
/**
 * Container entry point for the composite action scripts.
 *
 * The action.cjs scripts used to run through actions/github-script,
 * which always executes on the runner host even when the job specifies
 * a container. To keep the scripts inside the prebuilt image (and off
 * the host network), each action.yml pipes the composite inputs as
 * JSON on stdin and runs this thin CJS entry with the baked node:
 *
 * Inputs arrive via the INPUTS_JSON environment variable (the action.yml
 * steps set INPUTS_JSON: ${{ toJson(inputs) }}); stdin JSON is accepted
 * as a fallback for local runs and tests.
 *
 * The script path argument is resolved against ACTION_PATH (defaults
 * to actions/main/action.cjs); sibling actions pass their own path.
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

function readInputs () {
  // Preferred path: the step exports the composite inputs as JSON via
  // env (INPUTS_JSON) — env values are never rendered into the script
  // body or echoed, so tokens stay out of the logs.
  const fromEnv = process.env.INPUTS_JSON
  if (fromEnv !== undefined) {
    try {
      return JSON.parse(fromEnv)
    } catch (err) {
      throw new Error(`INPUTS_JSON is not valid JSON: ${err.message}`)
    }
  }
  // Fallback (tests, manual runs): JSON on stdin. A TTY stdin would
  // block forever waiting for input — fail fast with the same message
  // as an empty pipe.
  if (process.stdin.isTTY) {
    throw new Error('no inputs: set INPUTS_JSON or pipe the inputs JSON on stdin')
  }
  let raw = ''
  try {
    raw = fs.readFileSync(0, 'utf-8').trim()
  } catch (err) {
    throw new Error(`failed to read inputs from stdin: ${err.message}`)
  }
  if (!raw) {
    throw new Error('no inputs: set INPUTS_JSON or pipe the inputs JSON on stdin')
  }
  try {
    return JSON.parse(raw)
  } catch (err) {
    throw new Error(`stdin is not valid JSON: ${err.message}`)
  }
}

async function main () {
  const inputs = readInputs()

  // action.cjs takes its token from inputs.github_token; the shim's
  // Octokit reads env.GITHUB_TOKEN. Bridge the two so both surfaces
  // authenticate. The input wins: actions/github-script built its
  // Octokit from the github_token input, so a job-level env GITHUB_TOKEN
  // must not silently override the explicitly-passed token.
  if (inputs.github_token) {
    process.env.GITHUB_TOKEN = inputs.github_token
  }

  const { buildGithubScriptShim } = await import(
    path.join(actionPath, 'src', 'shim.js')
  )
  const { github, context, core } = await buildGithubScriptShim({ actionPath })

  if (inputs.github_token) core.setSecret(inputs.github_token)

  const scriptPath = process.argv[2] || path.join('actions', 'main', 'action.cjs')
  const script = require(path.isAbsolute(scriptPath) ? scriptPath : path.join(actionPath, scriptPath))
  await script({ github, context, inputs, actionPath, core, debug: debugEnabled })
}

main().catch((err) => {
  console.error(err && err.stack ? err.stack : err)
  process.exitCode = 1
})
