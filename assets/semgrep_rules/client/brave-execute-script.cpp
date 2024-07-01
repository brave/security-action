int main() {
  // ruleid: brave-execute-script
  web_frame->ExecuteScriptInIsolatedWorld(
      isolated_world_id_,
      blink::WebScriptSource(
          blink::WebString::FromUTF16(foobar)),
      blink::BackForwardCacheAware::kAllow);
  // ruleid: brave-execute-script
  web_contents()->GetPrimaryMainFrame()->ExecuteJavaScript(k_script, base::NullCallback());
}
