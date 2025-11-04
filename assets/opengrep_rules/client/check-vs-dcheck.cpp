// Test cases for check-vs-dcheck rule
#include "base/check.h"
#include "url/origin.h"

class TestClass {
 public:
  void SecurityChecks() {
    url::Origin origin;
    size_t buffer_size = 1024;
    size_t index = 0;
    bool has_permission = false;
    
    // SHOULD TRIGGER: Security-critical checks using DCHECK (should be CHECK)
    // ruleid: chromium-security-dcheck-should-be-check
    DCHECK(origin.IsSameOriginWith(trusted_origin_));
    // ruleid: chromium-security-dcheck-should-be-check
    DCHECK(has_permission);
    // ruleid: chromium-security-dcheck-should-be-check
    DCHECK_LT(index, buffer_size);
    // ruleid: chromium-security-dcheck-should-be-check
    DCHECK_GE(buffer_size, min_required_size_);
    // ruleid: chromium-security-dcheck-should-be-check
    DCHECK_EQ(security_level_, SECURE);
    // ruleid: chromium-security-dcheck-should-be-check
    DCHECK(IsAuthorized(user_privilege_));
    
    // SHOULD NOT TRIGGER: Non-security related DCHECKs (acceptable)
    // ok: chromium-security-dcheck-should-be-check
    DCHECK(widget != nullptr);
    // ok: chromium-security-dcheck-should-be-check
    DCHECK_EQ(color, RED);
    // ok: chromium-security-dcheck-should-be-check
    DCHECK(callback.is_null());
    // ok: chromium-security-dcheck-should-be-check
    DCHECK_GT(width, 0);
    
    // SHOULD NOT TRIGGER: Correct usage with CHECK (preferred for security)
    // ok: chromium-security-dcheck-should-be-check
    CHECK(origin.IsSameOriginWith(trusted_origin_));
    // ok: chromium-security-dcheck-should-be-check
    CHECK(has_permission);
    // ok: chromium-security-dcheck-should-be-check
    CHECK_LT(index, buffer_size);
    // ok: chromium-security-dcheck-should-be-check
    CHECK_GE(buffer_size, min_required_size_);
    // ok: chromium-security-dcheck-should-be-check
    CHECK_EQ(security_level_, SECURE);
    // ok: chromium-security-dcheck-should-be-check
    CHECK(IsAuthorized(user_privilege_));
  }
  
 private:
  url::Origin trusted_origin_;
  size_t min_required_size_ = 100;
  int security_level_ = 0;
  const int SECURE = 1;
  
  bool IsAuthorized(int privilege) { return privilege > 0; }
};