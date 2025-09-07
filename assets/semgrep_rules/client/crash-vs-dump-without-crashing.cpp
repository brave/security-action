// Test cases for crash-vs-dump-without-crashing rule
#include "base/debug/dump_without_crashing.h"
#include "base/check.h"

class TestClass {
 public:
  void BadExamples() {
    // SHOULD TRIGGER: Direct DumpWithoutCrashing usage (should use DUMP_WILL_BE_CHECK)
    if (some_error_condition_) {
      // ruleid: chromium-crash-vs-dump-without-crashing
      base::debug::DumpWithoutCrashing();
      return;
    }
    
    // SHOULD TRIGGER: Another direct usage
    if (!IsValidState()) {
      // ruleid: chromium-crash-vs-dump-without-crashing
      base::debug::DumpWithoutCrashing();
      // Continue execution but log crash dump
    }
  }
  
  void GoodExamples() {
    // SHOULD NOT TRIGGER: Using DUMP_WILL_BE_CHECK (preferred)
    if (some_error_condition_) {
      // ok: chromium-crash-vs-dump-without-crashing
      DUMP_WILL_BE_CHECK();
      return;
    }
    
    // SHOULD NOT TRIGGER: Using CHECK for immediate crash
    // ok: chromium-crash-vs-dump-without-crashing
    CHECK(IsValidState()) << "Invalid state detected";
    
    // SHOULD NOT TRIGGER: Using DCHECK for debug-only checks
    // ok: chromium-crash-vs-dump-without-crashing
    DCHECK(some_condition_) << "Debug assertion failed";
  }
  
  void FunctionWithParameters() {
    // SHOULD NOT TRIGGER: DumpWithoutCrashing with parameters (internal usage)
    if (critical_error_) {
      // ok: chromium-crash-vs-dump-without-crashing
      base::debug::DumpWithoutCrashing(FROM_HERE, base::Days(1));
      return;
    }
  }
  
 private:
  bool some_error_condition_ = false;
  bool some_condition_ = true;
  bool critical_error_ = false;
  
  bool IsValidState() const { return true; }
};