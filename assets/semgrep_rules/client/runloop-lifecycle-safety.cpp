// Test cases for runloop-lifecycle-safety rule
#include "base/run_loop.h"
#include "base/callback.h"

class TestClass {
 private:
  base::OnceClosure quit_callback_;
  base::RepeatingClosure quit_closure_;
  
 public:
  void BadExamples() {
    // SHOULD TRIGGER: Storing quit closure beyond RunLoop lifetime (dangerous)
    {
      base::RunLoop loop;
      // ruleid: chromium-runloop-quit-closure-lifecycle
      quit_callback_ = loop.QuitClosure();  // Closure becomes invalid when loop destructs
      loop.Run();
    }
    // quit_callback_ is now invalid but still stored in member
    
    // SHOULD TRIGGER: Another dangerous pattern
    {
      base::RunLoop nested_loop;
      // ruleid: chromium-runloop-quit-closure-lifecycle
      quit_closure_ = nested_loop.QuitWhenIdleClosure();  // Same issue
      nested_loop.Run();
    }
    // quit_closure_ is now invalid
    
    // SHOULD TRIGGER: Storing in member variable
    SetupAsyncOperation();  // This might try to use the invalid closure later
  }
  
  void GoodExamples() {
    // SHOULD NOT TRIGGER: Quit closure used within RunLoop scope (safe)
    {
      base::RunLoop loop;
      // ok: chromium-runloop-quit-closure-lifecycle
      auto quit_closure = loop.QuitClosure();  // Local variable, safe
      
      // Use closure immediately within scope
      PostTaskWithClosure(quit_closure);
      loop.Run();
    } // quit_closure destroyed with loop, safe
    
    // SHOULD NOT TRIGGER: QuitWhenIdleClosure used locally (safe)
    {
      base::RunLoop loop;
      // ok: chromium-runloop-quit-closure-lifecycle
      auto quit_when_idle = loop.QuitWhenIdleClosure();  // Local scope
      
      ScheduleDelayedTask(quit_when_idle);
      loop.Run();
    } // All destroyed together, safe
    
    // SHOULD NOT TRIGGER: Direct usage without storage (safe)
    base::RunLoop immediate_loop;
    // ok: chromium-runloop-quit-closure-lifecycle
    PostTaskWithClosure(immediate_loop.QuitClosure());
    immediate_loop.Run();
  }
  
  void MixedExample() {
    base::OnceClosure local_callback;
    
    // SHOULD TRIGGER: Even local variables can be problematic if used wrong
    {
      base::RunLoop temp_loop;
      // ruleid: chromium-runloop-quit-closure-lifecycle
      local_callback = temp_loop.QuitClosure();  // Stored beyond loop scope
      temp_loop.Run();
    }
    // local_callback is now invalid but could be used later
  }
  
  void SetupAsyncOperation() {
    // Simulates trying to use stored closure later
    if (quit_callback_) {
      // This would be dangerous if quit_callback_ is from destroyed RunLoop
      std::move(quit_callback_).Run();
    }
  }
  
  void PostTaskWithClosure(base::OnceClosure closure) {
    // Simulate posting task with closure
  }
  
  void ScheduleDelayedTask(base::RepeatingClosure closure) {
    // Simulate scheduling delayed task
  }
};