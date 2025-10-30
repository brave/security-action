// Test cases for container-performance-choice rule
#include <map>
#include <set>
#include "base/containers/flat_map.h"
#include "base/containers/flat_set.h"

class TestClass {
 public:
  void BadExamples() {
    // SHOULD TRIGGER: std::map for small/simple usage (consider base::flat_map)
    // ruleid: chromium-std-map-performance-consideration
    std::map<std::string, int> small_cache;
    small_cache["key1"] = 1;
    small_cache["key2"] = 2;
    
    // SHOULD TRIGGER: std::set for small collections (consider base::flat_set)
    // ruleid: chromium-std-map-performance-consideration
    std::set<int> small_ids;
    small_ids.insert(1);
    small_ids.insert(2);
    
    // SHOULD TRIGGER: std::multimap usage (consider alternatives)
    // ruleid: chromium-std-map-performance-consideration
    std::multimap<std::string, std::string> headers;
    headers.emplace("Content-Type", "text/html");
    
    // SHOULD TRIGGER: std::multiset usage (consider alternatives)
    // ruleid: chromium-std-map-performance-consideration
    std::multiset<int> duplicate_values;
    duplicate_values.insert(1);
    duplicate_values.insert(1);
  }
  
  void GoodExamples() {
    // SHOULD NOT TRIGGER: Using base::flat_map (preferred for small containers)
    // ok: chromium-std-map-performance-consideration
    base::flat_map<std::string, int> config_map;
    config_map["setting1"] = 100;
    config_map["setting2"] = 200;
    
    // SHOULD NOT TRIGGER: Using base::flat_set (preferred for small sets)
    // ok: chromium-std-map-performance-consideration
    base::flat_set<std::string> enabled_features;
    enabled_features.insert("feature1");
    enabled_features.insert("feature2");
    
    // SHOULD NOT TRIGGER: Other standard containers are fine
    // ok: chromium-std-map-performance-consideration
    std::vector<int> data = {1, 2, 3, 4, 5};
    // ok: chromium-std-map-performance-consideration
    std::unordered_map<std::string, int> hash_map;
    hash_map["key"] = 42;
  }
};

class DatabaseIndex {
 private:
  // SHOULD TRIGGER: No justification for std::map usage
  // ruleid: chromium-std-map-performance-consideration
  std::map<std::string, bool> feature_flags_;
  
  // SHOULD NOT TRIGGER: base::flat_map usage (preferred)
  // ok: chromium-std-map-performance-consideration
  base::flat_map<std::string, int> counters_;
};

// Write-once, read-many scenario
class ConfigReader {
 public:
  void LoadConfig() {
    // SHOULD NOT TRIGGER: base::flat_map ideal for write-once scenario
    // ok: chromium-std-map-performance-consideration
    base::flat_map<std::string, std::string> settings;
    settings["timeout"] = "30";
    settings["retries"] = "3";
    
    // SHOULD TRIGGER: std::map not ideal for write-once scenario
    // ruleid: chromium-std-map-performance-consideration
    std::map<std::string, int> limits;
    limits["max_connections"] = 100;
    limits["buffer_size"] = 8192;
  }
};

struct Record {
  int id;
  std::string data;
};
