// ruleid:  browser-dependency-inversion
chrome::FindBrowserWithTab(web_contents);
// ruleid:  browser-dependency-inversion
FindBrowserWithTab(web_contents);
// ruleid:  browser-dependency-inversion
BrowserView::GetBrowserViewForNativeWindow();
// ruleid:  browser-dependency-inversion
void MyClass::MyMethod(Browser* browser, bool test) { }
