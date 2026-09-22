import { When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import * as yaml from 'js-yaml'
import fs from 'fs'

When('the sandbox hardening workflow is loaded', function () {
  this.hardeningDoc = yaml.load(fs.readFileSync('.github/workflows/sandbox-hardening.yml', 'utf-8'))
})

When('the sandbox honeypot script is loaded', function () {
  this.honeypotScript = fs.readFileSync('scripts/sandbox-honeypot.sh', 'utf-8')
})

Then('a step runs the landrun installer', function () {
  const steps = this.hardeningDoc.jobs.honeypots.steps
  const step = steps.find(s => s.run && s.run.includes('src/installLandrun.js'))
  assert.ok(step, 'no step installs landrun')
  this.landrunStep = step
})

Then('the honeypot probes run after the installer', function () {
  const steps = this.hardeningDoc.jobs.honeypots.steps
  const probes = steps.find(s => s.run && s.run.includes('scripts/sandbox-honeypot.sh'))
  assert.ok(probes, 'honeypot probes step missing')
  assert.ok(steps.indexOf(this.landrunStep) < steps.indexOf(probes),
    'probes must run after the landrun installer')
})

Then('it reads the .env honeypot and the ssh honeypot inside the sandbox', function () {
  const s = this.honeypotScript
  assert.ok(s.includes('cat "$PWD/.env" "$HOME/.ssh/sandbox-canary"'),
    'honeypot read probe missing')
})

Then('it probes a zero-network localhost connect', function () {
  const s = this.honeypotScript
  assert.ok(s.includes("s.connect(('127.0.0.1', 8080))"),
    'zero-network localhost probe missing')
  // The localhost probe must run before the 443 grant is introduced.
  assert.ok(s.indexOf("s.connect(('127.0.0.1', 8080))") < s.indexOf('--connect-tcp 443'),
    'localhost probe runs before the 443 egress grant')
})

Then('it probes a TLS 443 egress connect', function () {
  const s = this.honeypotScript
  assert.ok(s.includes('--connect-tcp 443') && s.includes("s.connect(('api.github.com', 443))"),
    'TLS 443 probe missing')
})

Then('it fails closed when the sandbox binary is missing', function () {
  const s = this.honeypotScript
  assert.ok(s.includes('LANDRUN_BIN=/nonexistent') && s.includes('CI=true'),
    'fail-closed probe missing')
})
