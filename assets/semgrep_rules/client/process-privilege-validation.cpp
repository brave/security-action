// Test cases for process-privilege-validation rule
#include "content/public/browser/child_process_security_policy.h"
#include "content/public/browser/render_process_host.h"
#include "content/public/browser/content_browser_client.h"
#include "url/gurl.h"
#include "url/origin.h"

class ProcessPrivilegeExamples {
 public:
  // SHOULD TRIGGER: Navigation without CanCommitURL check
  // ruleid: chromium-process-privilege-validation
  void CommitNavigation(const GURL& url, int process_id) {
    // Directly committing navigation without privilege check
    DoCommitNavigation(url, process_id);
  }
  
  // SHOULD TRIGGER: Origin access without validation
  // ruleid: chromium-process-privilege-validation
  void AccessOriginData(const url::Origin& origin, int process_id) {
    // Accessing origin data without checking if process can access it
    auto sensitive_data = GetOriginSensitiveData(origin);
    SendDataToProcess(sensitive_data, process_id);
  }
  
  // SHOULD TRIGGER: Renderer process access method without validation
  // ruleid: chromium-process-privilege-validation
  bool LoadResource(content::RenderProcessHost* renderer_process) {
    // Allowing renderer to access resources without proper checks
    return renderer_process->CanAccessResource(resource_id_);
  }
  
  // SHOULD NOT TRIGGER: Proper CanCommitURL validation (secure)
  // ok: chromium-process-privilege-validation
  void SafeCommitNavigation(const GURL& url, int process_id, 
                           content::RenderProcessHost* process) {
    if (!GetContentClient()->browser()->CanCommitURL(process, url)) {
      LOG(ERROR) << "Process cannot commit URL: " << url;
      return;
    }
    
    // Safe to proceed after validation
    DoCommitNavigation(url, process_id);
  }
  
  // SHOULD NOT TRIGGER: Proper CanAccessDataForOrigin validation (secure)
  // ok: chromium-process-privilege-validation
  void SafeAccessOriginData(const url::Origin& origin, int process_id) {
    auto* policy = content::ChildProcessSecurityPolicy::GetInstance();
    if (!policy->CanAccessDataForOrigin(process_id, origin)) {
      LOG(ERROR) << "Process cannot access origin data";
      return;
    }
    
    // Safe to access after validation
    auto sensitive_data = GetOriginSensitiveData(origin);
    SendDataToProcess(sensitive_data, process_id);
  }
  
  // SHOULD NOT TRIGGER: Non-security related method names
  // ok: chromium-process-privilege-validation
  void UpdateConfiguration(const GURL& config_url, int process_id) {
    // Configuration updates don't require same level of validation
    ApplyConfiguration(config_url);
  }
  
  // SHOULD NOT TRIGGER: No process/URL parameters
  void RefreshUI() {
    // UI refresh doesn't involve cross-process security
    UpdateDisplay();
  }
  
 private:
  int resource_id_ = 0;
  
  void DoCommitNavigation(const GURL& url, int process_id) {}
  std::string GetOriginSensitiveData(const url::Origin& origin) { return ""; }
  void SendDataToProcess(const std::string& data, int process_id) {}
  void ApplyConfiguration(const GURL& config_url) {}
  void UpdateDisplay() {}
};