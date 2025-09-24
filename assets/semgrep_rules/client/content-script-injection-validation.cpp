// Test cases for content-script-injection-validation rule
#include "content/public/browser/web_contents.h"
#include "extensions/browser/extension_host.h"
#include "url/origin.h"
#include "third_party/blink/public/web/web_frame.h"
#include "third_party/blink/public/web/web_script_source.h"

enum class ScriptSource {
  kTrusted,
  kUntrusted,
  kUserProvided
};

class ContentScriptInjectionExamples {
 public:
  void BadScriptInjection() {
    // SHOULD TRIGGER: Direct script execution without validation
    std::string user_script = GetUserProvidedScript();
    // ruleid: chromium-content-script-injection-validation
    ExecuteScript(user_script, callback_);
    
    // SHOULD TRIGGER: JavaScript injection without origin check
    std::string dangerous_code = "alert('XSS')";
    // ruleid: chromium-content-script-injection-validation
    web_contents_->ExecuteJavaScript(base::UTF8ToUTF16(dangerous_code), callback_);
    
    // SHOULD TRIGGER: Content script injection without CSP validation
    std::string script_content = LoadExternalScript();
    // ruleid: chromium-content-script-injection-validation
    InjectScript(script_content, target_frame_);
    
    // SHOULD TRIGGER: Extension content script registration without validation
    ExtensionScriptDetails script_details;
    script_details.code = GetDynamicScript();
    // ruleid: chromium-content-script-injection-validation
    RegisterContentScript(script_details, completion_callback_);
    
    // SHOULD TRIGGER: Adding content script without origin validation
    std::string script_name = "dynamic_script";
    // ruleid: chromium-content-script-injection-validation
    AddContentScript(script_name, script_source_, target_origins_);

    // SHOULD TRIGGER: ExecuteScriptInIsolatedWorld without validation
    // ruleid: chromium-content-script-injection-validation
    web_frame_->ExecuteScriptInIsolatedWorld(
        isolated_world_id_,
        blink::WebScriptSource(
            blink::WebString::FromUTF16(foobar_)),
        blink::BackForwardCacheAware::kAllow);

    // SHOULD TRIGGER: GetPrimaryMainFrame()->ExecuteJavaScript without validation
    // ruleid: chromium-content-script-injection-validation
    web_contents_->GetPrimaryMainFrame()->ExecuteJavaScript(k_script_, base::NullCallback());
  }
  
  void GoodScriptInjection1() {
    // SHOULD NOT TRIGGER: Origin validation before script execution (secure)
    url::Origin current_origin = GetCurrentOrigin();
    if (!IsAllowedOrigin(current_origin)) {
      return;
    }
    std::string validated_script = GetTrustedScript();
    // ok: chromium-content-script-injection-validation
    ExecuteScript(validated_script, callback_);
  }

  void GoodScriptInjection2() {
    // SHOULD NOT TRIGGER: CSP validation before injection (secure)
    std::string safe_code = GetSanitizedCode();
    if (!ValidateCSP(safe_code)) {
      LOG(ERROR) << "Script blocked by CSP validation";
      return;
    }
    // ok: chromium-content-script-injection-validation
    web_contents_->ExecuteJavaScript(base::UTF8ToUTF16(safe_code), callback_);
  }

  void GoodScriptInjection3() {
    // SHOULD NOT TRIGGER: Trusted script source (secure)
    if (script_source == ScriptSource::kTrusted) {
      std::string trusted_script = GetBuiltinScript();
      // ok: chromium-content-script-injection-validation
      InjectScript(trusted_script, target_frame_);
    }
  }

  void GoodScriptInjection4() {
    // SHOULD NOT TRIGGER: Internal script operations
    // ok: chromium-content-script-injection-validation
    RefreshScriptCache();
    // ok: chromium-content-script-injection-validation
    CleanupExpiredScripts();
  }
  
 private:
  content::WebContents* web_contents_ = nullptr;
  content::RenderFrameHost* target_frame_ = nullptr;
  blink::WebFrame* web_frame_ = nullptr;
  ScriptSource script_source_ = ScriptSource::kUntrusted;
  std::vector<url::Origin> target_origins_;
  base::OnceCallback<void()> callback_;
  base::OnceCallback<void()> completion_callback_;
  int isolated_world_id_ = 1;
  std::u16string foobar_ = u"test script";
  std::u16string k_script_ = u"console.log('test')";
  
  std::string GetUserProvidedScript() { return "user_script()"; }
  std::string GetTrustedScript() { return "trusted_script()"; }
  std::string GetBuiltinScript() { return "builtin_script()"; }
  std::string GetSanitizedCode() { return "safe_code()"; }
  std::string GetDynamicScript() { return "dynamic_script()"; }
  std::string LoadExternalScript() { return "external_script()"; }
  
  url::Origin GetCurrentOrigin() {
    return url::Origin::Create(GURL("https://example.com"));
  }
  
  bool IsAllowedOrigin(const url::Origin& origin) {
    return origin.scheme() == "https";
  }
  
  bool ValidateCSP(const std::string& code) {
    // Check if code complies with Content Security Policy
    return code.find("<script>") == std::string::npos;
  }
  
  void ExecuteScript(const std::string& script, base::OnceCallback<void()> callback) {}
  void InjectScript(const std::string& code, content::RenderFrameHost* frame) {}
  void AddContentScript(const std::string& name, ScriptSource source, 
                       const std::vector<url::Origin>& origins) {}
  void RegisterContentScript(const ExtensionScriptDetails& details, 
                            base::OnceCallback<void()> callback) {}
  void RefreshScriptCache() {}
  void CleanupExpiredScripts() {}
};

struct ExtensionScriptDetails {
  std::string code;
  std::vector<std::string> matches;
};