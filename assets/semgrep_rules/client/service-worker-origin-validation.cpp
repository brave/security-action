// Test cases for service-worker-origin-validation rule
#include "content/public/browser/service_worker_context.h"
#include "url/gurl.h"
#include "url/origin.h"

class ServiceWorkerSecurityExamples {
 public:
  void BadServiceWorkerUsage() {
    // SHOULD TRIGGER: Service Worker registration without origin validation
    GURL sw_url("https://external-site.com/sw.js");
    // ruleid: chromium-service-worker-origin-validation
    sw_context_->RegisterServiceWorker(sw_url, callback_);

    // SHOULD TRIGGER: Starting Service Worker without validation
    GURL untrusted_sw_url = GetUserProvidedUrl();
    // ruleid: chromium-service-worker-origin-validation
    sw_context_->StartServiceWorker(untrusted_sw_url, start_callback_);

    // SHOULD TRIGGER: Starting worker for scope without validation
    GURL scope("https://untrusted.com/");
    // ruleid: chromium-service-worker-origin-validation
    sw_context_->StartWorkerForScope(scope, start_callback_);
  }
  
  void GoodServiceWorkerUsage() {
    // SHOULD NOT TRIGGER: Origin validation before registration (secure)
    GURL sw_url("https://trusted-site.com/sw.js");
    url::Origin sw_origin = url::Origin::Create(sw_url);
    if (sw_origin.IsSameOriginWith(expected_origin_)) {
      // ok: chromium-service-worker-origin-validation
      sw_context_->RegisterServiceWorker(sw_url, callback_);
    }

    // SHOULD NOT TRIGGER: Origin validation before starting
    GURL validated_sw_url = GetTrustedUrl();
    url::Origin validated_origin = url::Origin::Create(validated_sw_url);
    if (!IsValidServiceWorkerOrigin(validated_origin)) {
      return;
    }
    // ok: chromium-service-worker-origin-validation
    sw_context_->StartServiceWorker(validated_sw_url, start_callback_);

    // SHOULD NOT TRIGGER: Internal Service Worker operations
    RefreshServiceWorkerCache();
    UpdateServiceWorkerRegistration();
  }
  
  void JavaScriptServiceWorkerExamples() {
    // These would be caught in JavaScript files
    // SHOULD TRIGGER in JS: navigator.serviceWorker.register('/sw.js');  
    // SHOULD NOT TRIGGER in JS: if (origin === expectedOrigin) navigator.serviceWorker.register('/sw.js');
  }
  
 private:
  content::ServiceWorkerContext* sw_context_ = nullptr;
  url::Origin expected_origin_ = url::Origin::Create(GURL("https://trusted.com"));
  base::OnceCallback<void()> callback_;
  base::OnceCallback<void()> start_callback_;
  
  GURL GetUserProvidedUrl() { return GURL("https://user-provided.com/sw.js"); }
  GURL GetTrustedUrl() { return GURL("https://trusted.com/sw.js"); }
  
  bool IsValidServiceWorkerOrigin(const url::Origin& origin) {
    return origin.scheme() == "https" && origin.host() == "trusted.com";
  }
  
  void RefreshServiceWorkerCache() {}
  void UpdateServiceWorkerRegistration() {}
};

