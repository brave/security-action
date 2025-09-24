// Test cases for webui-origin-validation rule
#include "chrome/browser/ui/webui/chrome_web_ui_controller_factory.h"
#include "content/public/browser/web_ui_controller.h"
#include "url/gurl.h"

class BadWebUIController : public content::WebUIController {
 public:
  explicit BadWebUIController(content::WebUI* web_ui) 
    : WebUIController(web_ui) {}

  // SHOULD TRIGGER: Handling external URL without origin validation
  // ruleid: chromium-webui-origin-validation
  void HandleExternalUrl(const GURL& external_url) {
    // Directly using external URL in privileged WebUI context
    ProcessExternalContent(external_url);
  }
  
  // SHOULD TRIGGER: Processing user data without validation
  // ruleid: chromium-webui-origin-validation
  void HandleUserData(const std::string& user_input) {
    // Processing user input without origin/source validation
    ExecuteCommand(user_input);
  }
  
  // SHOULD TRIGGER: Handling base::Value from external source
  // ruleid: chromium-webui-origin-validation
  void HandleConfigData(const base::Value& config) {
    // Using config data without validating source
    ApplyConfiguration(config);
  }
  
 private:
  void ProcessExternalContent(const GURL& url) {}
  void ExecuteCommand(const std::string& command) {}
  void ApplyConfiguration(const base::Value& config) {}
};

class GoodWebUIController : public content::WebUIController {
 public:
  explicit GoodWebUIController(content::WebUI* web_ui) 
    : WebUIController(web_ui) {}

  // SHOULD NOT TRIGGER: Proper origin validation (secure)
  // ok: chromium-webui-origin-validation
  void HandleExternalUrl(const GURL& external_url, const url::Origin& origin) {
    if (!IsValidOrigin(origin)) {
      // Reject request from invalid origin
      return;
    }
    
    // Safe to process after validation
    ProcessExternalContent(external_url);
  }
  
  // SHOULD NOT TRIGGER: WebUI scheme validation (secure)
  // ok: chromium-webui-origin-validation
  void HandleUserData(const std::string& user_input) {
    if (web_ui()->GetWebContents()->GetURL().SchemeIs("chrome")) {
      // Only process if from chrome:// scheme
      ExecuteCommand(user_input);
    }
  }
  
  // SHOULD NOT TRIGGER: Internal method without external data
  // ok: chromium-webui-origin-validation
  void HandleInternalConfig() {
    // Internal configuration, no external data
    base::Value internal_config = LoadInternalConfig();
    ApplyConfiguration(internal_config);
  }
  
  // SHOULD NOT TRIGGER: No sensitive parameters
  // ok: chromium-webui-origin-validation
  void HandleSimpleRequest() {
    // Simple request with no external data
    RefreshUI();
  }
  
 private:
  bool IsValidOrigin(const url::Origin& origin) {
    // Implement origin validation logic
    return origin.scheme() == "chrome" || origin.scheme() == "chrome-untrusted";
  }
  
  void ProcessExternalContent(const GURL& url) {}
  void ExecuteCommand(const std::string& command) {}
  void ApplyConfiguration(const base::Value& config) {}
  base::Value LoadInternalConfig() { return base::Value(); }
  void RefreshUI() {}
};

// SHOULD NOT TRIGGER: Not a WebUI controller
class RegularController {
 public:
  // ok: chromium-webui-origin-validation
  void HandleUserData(const std::string& data) {
    // Not a WebUI, so different security model applies
    ProcessData(data);
  }
  
 private:
  void ProcessData(const std::string& data) {}
};