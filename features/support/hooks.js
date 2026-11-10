import { After } from '@cucumber/cucumber'
import fs from 'fs'

// Restore GITHUB_STEP_SUMMARY and remove the temp summary file created by
// the "octokit rejects comment writes" step.
After(function () {
  if (this.prevStepSummaryEnv !== undefined) {
    process.env.GITHUB_STEP_SUMMARY = this.prevStepSummaryEnv
    this.prevStepSummaryEnv = undefined
  } else if (this.summaryFile) {
    delete process.env.GITHUB_STEP_SUMMARY
  }
  if (this.summaryFile) {
    try { fs.unlinkSync(this.summaryFile) } catch (_) { /* already gone */ }
    this.summaryFile = null
  }
})
