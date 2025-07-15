// Test file to trigger Semgrep security violations
// This file should be removed before merging

// This should trigger: missing-noopener-window-open-native
function openUnsafeWindow(url) {
  // Missing noopener - security violation
  return window.open(url, '_blank');
}

// This should trigger: url-constructor-base
function createURL(userInput, baseUrl) {
  // URL constructor with variable input - security violation
  return new URL(userInput, baseUrl);
}

// Export functions to avoid unused variable warnings
module.exports = {
  openUnsafeWindow,
  createURL
};