// Test cases for network-request-validation rule
#include "services/network/public/cpp/simple_url_loader.h"
#include "net/url_request/url_request.h"
#include "url/gurl.h"

class NetworkRequestExamples {
 public:
  void BadNetworkRequests() {
    // SHOULD NOT TRIGGER: URLLoader without URL validation (pattern doesn't match)
    auto loader = network::SimpleURLLoader::Create(request_, traffic_annotation_);
    // ok: chromium-network-request-validation
    loader->LoadRequest(request_, callback_);
    
    // SHOULD NOT TRIGGER: URLRequest without scheme validation (pattern doesn't match)
    GURL external_url("https://user-provided-url.com");
    // ok: chromium-network-request-validation
    auto url_request = URLRequest::Create(external_url, request_delegate_);
    
    // SHOULD NOT TRIGGER: URL rewriting without validation (pattern doesn't match assignment)
    GURL original_url = GetUserProvidedUrl();
    // ok: chromium-network-request-validation
    GURL rewritten_url = RewriteURL(original_url);
    MakeRequest(rewritten_url);
    
    // SHOULD TRIGGER: SimpleURLLoader with user/external data
    auto user_request = CreateUserRequest();
    // ruleid: chromium-network-request-validation
    auto user_loader = SimpleURLLoader::Create(user_request, traffic_annotation_);
    
    auto external_request = CreateExternalRequest();
    // ruleid: chromium-network-request-validation
    auto external_loader = SimpleURLLoader::Create(external_request, traffic_annotation_);
    
    auto untrusted_request = CreateUntrustedRequest();
    // ruleid: chromium-network-request-validation
    auto untrusted_loader = SimpleURLLoader::Create(untrusted_request, traffic_annotation_);
  }
  
  void GoodNetworkRequests() {
    // SHOULD NOT TRIGGER: URL validation before loading
    GURL checked_url = GetUserProvidedUrl();
    if (!IsUrlAllowed(checked_url)) {
      return;
    }
    auto safe_loader = network::SimpleURLLoader::Create(request_, traffic_annotation_);
    // ok: chromium-network-request-validation
    safe_loader->LoadRequest(request_, callback_);
    
    // SHOULD NOT TRIGGER: Scheme validation before URLRequest
    GURL validated_url("https://trusted-api.com");
    if (validated_url.SchemeIsHTTPOrHTTPS()) {
      // ok: chromium-network-request-validation
      auto safe_request = URLRequest::Create(validated_url, request_delegate_);
    }
    
    // SHOULD NOT TRIGGER: Validated URL rewriting
    GURL source_url = GetTrustedUrl();
    // ok: chromium-network-request-validation
    GURL target_url = RewriteURL(source_url);
    if (!IsValidRewrite(source_url, target_url)) {
      LOG(ERROR) << "Invalid URL rewrite rejected";
      return;
    }
    MakeRequest(target_url);
    
    // SHOULD NOT TRIGGER: Internal/trusted requests
    auto internal_request = CreateInternalRequest();
    auto internal_loader = SimpleURLLoader::Create(internal_request, traffic_annotation_);
    
    // SHOULD NOT TRIGGER: Hardcoded trusted URLs
    GURL trusted_url("https://api.brave.com/endpoint");
    // ok: chromium-network-request-validation
    auto trusted_request = URLRequest::Create(trusted_url, request_delegate_);
  }
  
 private:
  std::unique_ptr<network::ResourceRequest> request_;
  net::NetworkTrafficAnnotationTag traffic_annotation_;
  base::OnceCallback<void()> callback_;
  net::URLRequest::Delegate* request_delegate_ = nullptr;
  
  GURL GetUserProvidedUrl() { return GURL("https://example.com"); }
  GURL GetTrustedUrl() { return GURL("https://trusted.com"); }
  bool IsUrlAllowed(const GURL& url) { return url.SchemeIsHTTPOrHTTPS(); }
  bool IsValidRewrite(const GURL& original, const GURL& rewritten) { return true; }
  void MakeRequest(const GURL& url) {}
  
  std::unique_ptr<network::ResourceRequest> CreateUserRequest() { return nullptr; }
  std::unique_ptr<network::ResourceRequest> CreateExternalRequest() { return nullptr; }
  std::unique_ptr<network::ResourceRequest> CreateUntrustedRequest() { return nullptr; }
  std::unique_ptr<network::ResourceRequest> CreateInternalRequest() { return nullptr; }
};