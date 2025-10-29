// ruleid: web-contents-user-data
class MyTest : public WebContentsUserData {
}
// ruleid: web-contents-user-data
class MyTest : public content::WebContentsUserData {
}
// ok: web-contents-user-data
class MyTest : public WebContentsObserver {
}
