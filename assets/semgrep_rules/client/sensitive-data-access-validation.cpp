// Test cases for sensitive-data-access-validation rule  
#include "chrome/browser/profiles/profile.h"
#include "components/password_manager/core/browser/password_store.h"
#include "net/cookies/cookie_store.h"
#include "url/gurl.h"

enum class Permission {
  kCookies,
  kPasswords,
  kHistory
};

class SensitiveDataAccessExamples {
 public:
  void BadSensitiveDataAccess() {
    // SHOULD TRIGGER: Cookie access without permission check
    GURL target_url("https://example.com");
    // ruleid: chromium-sensitive-data-access-validation
    auto cookies = GetCookies(target_url, cookie_callback_);
    
    // SHOULD TRIGGER: Setting cookies without validation
    std::string cookie_value = "session=abc123";
    // ruleid: chromium-sensitive-data-access-validation
    SetCookie(target_url, cookie_value, set_callback_);
    
    // SHOULD TRIGGER: Password access without authorization
    // ruleid: chromium-sensitive-data-access-validation
    auto stored_passwords = GetStoredPasswords(password_callback_);
    
    // SHOULD TRIGGER: Saving password without validation
    PasswordCredential credential;
    credential.username = "user@example.com";
    credential.password = "secret123";
    // ruleid: chromium-sensitive-data-access-validation
    SavePassword(credential, save_callback_);
    
    // SHOULD TRIGGER: Incognito profile access without checks
    // ruleid: chromium-sensitive-data-access-validation
    Profile* incognito = GetIncognitoProfile();
    ProcessIncognitoData(incognito);
    
    // SHOULD TRIGGER: Private browsing data access
    // ruleid: chromium-sensitive-data-access-validation
    auto private_data = GetPrivateBrowsingData(data_callback_);
    
    // SHOULD TRIGGER: History data access without authorization
    std::string query = "sensitive search";
    // ruleid: chromium-sensitive-data-access-validation
    AccessHistoryData(query, history_callback_);
  }
  
  void GoodSensitiveDataAccess() {
    // SHOULD NOT TRIGGER: Cookie access with permission check (secure)
    if (!HasPermission(Permission::kCookies)) {
      return;
    }
    GURL authorized_url("https://trusted.com");
    // ok: chromium-sensitive-data-access-validation
    auto safe_cookies = GetCookies(authorized_url, cookie_callback_);
    
    // SHOULD NOT TRIGGER: Incognito check before profile access (secure)
    Profile* profile = GetCurrentProfile();
    if (profile->IsOffTheRecord() && !allow_incognito_) {
      LOG(WARNING) << "Incognito access not allowed";
      return;
    }
    ProcessProfileData(profile);
    
    // SHOULD NOT TRIGGER: Origin authorization before sensitive access (secure)
    url::Origin requesting_origin = GetRequestingOrigin();
    if (!IsAuthorizedForSensitiveData(requesting_origin)) {
      return;
    }
    // ok: chromium-sensitive-data-access-validation
    auto authorized_data = GetPrivateBrowsingData(data_callback_);
    
    // SHOULD NOT TRIGGER: Non-sensitive operations
    RefreshUIState();
    UpdatePreferences();
  }
  
  bool IsOffTheRecordCheck() {
    // SHOULD NOT TRIGGER: Just checking incognito state (not accessing data)
    Profile* profile = GetCurrentProfile();
    return profile->IsOffTheRecord();
  }
  
 private:
  bool allow_incognito_ = false;
  base::OnceCallback<void()> cookie_callback_;
  base::OnceCallback<void()> set_callback_;
  base::OnceCallback<void()> password_callback_;
  base::OnceCallback<void()> save_callback_;
  base::OnceCallback<void()> data_callback_;
  base::OnceCallback<void()> history_callback_;
  
  bool HasPermission(Permission permission) {
    // Check if current context has required permission
    return permission == Permission::kCookies; // Simplified
  }
  
  bool IsAuthorizedForSensitiveData(const url::Origin& origin) {
    return origin.scheme() == "https";
  }
  
  Profile* GetCurrentProfile() { return nullptr; }
  Profile* GetIncognitoProfile() { return nullptr; }
  url::Origin GetRequestingOrigin() { 
    return url::Origin::Create(GURL("https://requester.com")); 
  }
  
  std::vector<net::Cookie> GetCookies(const GURL& url, base::OnceCallback<void()> callback) { 
    return {}; 
  }
  void SetCookie(const GURL& url, const std::string& cookie, base::OnceCallback<void()> callback) {}
  std::vector<password_manager::PasswordForm> GetStoredPasswords(base::OnceCallback<void()> callback) { 
    return {}; 
  }
  void SavePassword(const PasswordCredential& credential, base::OnceCallback<void()> callback) {}
  std::string GetPrivateBrowsingData(base::OnceCallback<void()> callback) { return ""; }
  void AccessHistoryData(const std::string& query, base::OnceCallback<void()> callback) {}
  
  void ProcessIncognitoData(Profile* profile) {}
  void ProcessProfileData(Profile* profile) {}
  void RefreshUIState() {}
  void UpdatePreferences() {}
};

struct PasswordCredential {
  std::string username;
  std::string password;
};