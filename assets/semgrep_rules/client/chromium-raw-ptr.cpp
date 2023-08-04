class Foo {
  // ruleid: chromium-raw-ptr
  Bar* bar_;  // This should be rewritten to 'raw_ptr<Bar> bar_'.

};