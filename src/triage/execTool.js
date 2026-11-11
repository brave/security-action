import { spawn } from 'node:child_process'
import buildSandboxedCmd from '../sandboxedCmd.js'

/**
 * Exec tool for the triage agent: runs a shell command inside the Landlock
 * wrapper (scripts/with-sandbox.sh via buildSandboxedCmd).
 *
 * Hard guarantees requested for the triage path:
 * - no network: egress stays false, no --connect-tcp grant is emitted
 * - no environment passthrough: the child gets only PATH/TMPDIR/HOME (or the
 *   given allowlist), so action secrets never reach agent-run commands
 * - meaningful grants: the repo workspace read-only, the action tree
 *   read-only, a scratch directory read-write for temp files
 *
 * Non-zero exits and timeouts are reported as tool output (the agent can
 * observe and recover); spawn failures fail the tool call.
 */
export function createExecTool ({
  repoRoot,
  actionPath,
  scratchDir,
  envAllowlist = ['PATH', 'TMPDIR', 'HOME'],
  timeoutMs = 10000,
  maxOutputChars = 20000,
  spawnImpl = spawn
}) {
  if (!repoRoot || !actionPath || !scratchDir) {
    throw new Error('exec tool requires repoRoot, actionPath and scratchDir')
  }
  return async function exec (command) {
    if (!command || typeof command !== 'string') {
      throw new Error('exec requires a command')
    }
    const sandboxCmd = buildSandboxedCmd({
      actionPath,
      cmd: command,
      readDirs: [repoRoot],
      writeDirs: [scratchDir],
      egress: false
    })
    const env = {}
    for (const key of envAllowlist) {
      if (process.env[key] !== undefined) env[key] = process.env[key]
    }
    let child
    try {
      child = spawnImpl('bash', ['-c', sandboxCmd], { cwd: repoRoot, env })
    } catch (err) {
      throw new Error(`exec failed: ${err.message}`)
    }
    let out = ''
    child.stdout.on('data', (d) => { out += d })
    child.stderr.on('data', (d) => { out += d })
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      child.kill('SIGKILL')
    }, timeoutMs)
    const code = await new Promise((resolve) => {
      child.on('error', (err) => resolve(err))
      child.on('close', (c) => resolve(c))
    })
    clearTimeout(timer)
    if (code instanceof Error) {
      throw new Error(`exec failed: ${code.message}`)
    }
    if (out.length > maxOutputChars) out = out.slice(0, maxOutputChars) + '\n[truncated]'
    if (timedOut) out += `\ntimed out after ${timeoutMs}ms`
    if (typeof code === 'number' && code !== 0) out += `\nexit code ${code}`
    return out
  }
}
