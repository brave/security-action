// Test cases for weakptr-factory-placement rule
#include "base/memory/weak_ptr.h"

// SHOULD TRIGGER: WeakPtrFactory not last member
// ruleid: chromium-weakptr-factory-placement
class BadClass1 {
 public:
  BadClass1() : weak_factory_(this) {}

 private:
  base::WeakPtrFactory<BadClass1> weak_factory_;  // Should be last
  std::unique_ptr<int> data_;                     // This should come before factory
  int counter_ = 0;                               // This should come before factory
};

// SHOULD TRIGGER: Multiple members after factory
// ruleid: chromium-weakptr-factory-placement
class BadClass2 {
 private:
  std::string name_;
  base::WeakPtrFactory<BadClass2> weak_factory_;  // Should be last
  bool enabled_ = true;                           // This should come before factory
  std::vector<int> items_;                        // This should come before factory
};

// SHOULD NOT TRIGGER: WeakPtrFactory is last member (correct)
// ok: chromium-weakptr-factory-placement
class GoodClass1 {
 public:
  GoodClass1() : weak_factory_(this) {}

 private:
  std::unique_ptr<int> data_;
  int counter_ = 0;
  std::string name_;
  bool enabled_ = true;
  base::WeakPtrFactory<GoodClass1> weak_factory_;  // Correctly placed last
};

// SHOULD NOT TRIGGER: Only WeakPtrFactory member
// ok: chromium-weakptr-factory-placement
class GoodClass2 {
 public:
  GoodClass2() : weak_factory_(this) {}

 private:
  base::WeakPtrFactory<GoodClass2> weak_factory_;  // Only member, so correct
};

// SHOULD NOT TRIGGER: No WeakPtrFactory
// ok: chromium-weakptr-factory-placement
class GoodClass3 {
 private:
  int data_;
  std::string name_;
  bool enabled_;
};