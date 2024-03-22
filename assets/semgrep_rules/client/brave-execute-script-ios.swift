import WebKit

let webView = WKWebView(frame: .zero)
// ruleid: brave-execute-script-ios
webView.evaluateJavaScript("document.title") { (result, error) in
    if let result = result {
        print("Title: \(result)")
    } else if let error = error {
        print("Evaluate error: \(error.localizedDescription)")
    }
}
// ruleid: brave-execute-script-ios
try await webView.evaluateSafeJavaScriptThrowing(
    functionName: "localStorage.setItem",
    args: ["storageKey", "receipt"],
    contentWorld: .defaultClient
)
// ruleid: brave-execute-script-ios
webView.evaluateSafeJavaScript(
          functionName: "alert(123)",
          contentWorld: .page
        )
// ruleid: brave-execute-script-ios
let userScript = WKUserScript(source: "document.title = 'Test';", injectionTime: .atDocumentEnd, forMainFrameOnly: true)
webView.configuration.userContentController.addUserScript(userScript)