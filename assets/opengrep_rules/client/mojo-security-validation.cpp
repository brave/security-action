// Test cases for mojo-security-validation rule
#include "content/public/browser/child_process_security_policy.h"
#include "url/gurl.h"
#include "url/origin.h"
#include "base/files/file_path.h"

class BadMojoInterface : public mojom::FileService {
 public:
  // SHOULD TRIGGER: File path without validation (dangerous)
  // ruleid: chromium-mojo-privilege-validation
  void ReadFile(const base::FilePath& file_path) override {
    // Directly using file_path without validation
    std::string content = ReadFileContent(file_path);
    SendResponse(content);
  }
  
  // SHOULD TRIGGER: URL without origin validation (dangerous)
  // ruleid: chromium-mojo-privilege-validation
  void FetchResource(const GURL& url, int render_process_id) override {
    // Using URL without checking if process can access it
    DownloadFromUrl(url);
  }
  
  // SHOULD TRIGGER: Origin without validation (dangerous)
  // ruleid: chromium-mojo-privilege-validation
  void AccessOriginData(const url::Origin& origin, int pid) override {
    // Accessing origin data without permission check
    auto data = GetOriginSensitiveData(origin);
    ProcessData(data);
  }
  
 private:
  std::string ReadFileContent(const base::FilePath& path) { return ""; }
  void SendResponse(const std::string& content) {}
  void DownloadFromUrl(const GURL& url) {}
  std::string GetOriginSensitiveData(const url::Origin& origin) { return ""; }
  void ProcessData(const std::string& data) {}
};

class GoodMojoInterface : public mojom::FileService {
 public:
  // SHOULD NOT TRIGGER: Proper file path validation (secure)
  // ok: chromium-mojo-privilege-validation
  void ReadFile(const base::FilePath& file_path, int render_process_id) override {
    auto* policy = content::ChildProcessSecurityPolicy::GetInstance();
    if (!policy->CanReadFile(render_process_id, file_path)) {
      // Reject the request
      return;
    }
    
    // Safe to proceed
    std::string content = ReadFileContent(file_path);
    SendResponse(content);
  }
  
  // SHOULD NOT TRIGGER: Proper origin validation (secure)
  // ok: chromium-mojo-privilege-validation
  void AccessOriginData(const url::Origin& origin, int pid) override {
    auto* policy = content::ChildProcessSecurityPolicy::GetInstance();
    if (!policy->CanAccessDataForOrigin(pid, origin)) {
      // Reject the request
      return;
    }
    
    // Safe to access origin data
    auto data = GetOriginSensitiveData(origin);
    ProcessData(data);
  }
  
  // SHOULD NOT TRIGGER: Non-sensitive parameters (safe)
  // ok: chromium-mojo-privilege-validation
  void GetConfig(int setting_id) override {
    // No privilege-presuming data, validation not needed
    auto config = GetConfigValue(setting_id);
    SendConfig(config);
  }
  
  // SHOULD NOT TRIGGER: Non-override method (not a Mojo interface)
  // ok: chromium-mojo-privilege-validation
  void HelperMethod(const base::FilePath& path) {
    // This is not a Mojo interface method, so validation rules don't apply
    ProcessPath(path);
  }
  
 private:
  std::string ReadFileContent(const base::FilePath& path) { return ""; }
  void SendResponse(const std::string& content) {}
  std::string GetOriginSensitiveData(const url::Origin& origin) { return ""; }
  void ProcessData(const std::string& data) {}
  std::string GetConfigValue(int id) { return ""; }
  void SendConfig(const std::string& config) {}
  void ProcessPath(const base::FilePath& path) {}
};