// ruleid: in-process-browser-test
class MyTest : public InProcessBrowserTest {
}

// ok: in-process-browser-test
class MyTest : public PlatformBrowserTest {
}
