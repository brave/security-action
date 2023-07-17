int main() {
    // chromium-insecure-gurl
    GURL url = ...;
    // chromium-insecure-gurl
    GURL origin = url.DeprecatedGetOriginAsURL();
    // BUG: `origin` will be incorrect if `url` is an "about:blank" URL
    // BUG: `origin` will be incorrect if `url` came from a sandboxed frame.
    // BUG: `origin` will be incorrect when `url` (rather than
    //      `base_url_for_data_url`) is used when working with loadDataWithBaseUrl
    //      (see also https://crbug.com/1201514).
    // BUG: `origin` will be empty if `url` is a blob: URL like
    //      "blob:http://origin/guid-goes-here".
    // NOTE: `GURL origin` is also an anti-pattern; see the "Use correct type to
    //       represent origins" section below.

    // Blink-specific example:
    // chromium-insecure-gurl
    KURL url = ...;
    // chromium-insecure-gurl
    scoped_refptr<SecurityOrigin> origin = SecurityOrigin::Create(url);
    // BUG: `origin` will be incorrect if `url` is an "about:blank" URL
    // BUG: `origin` will be incorrect if `url` came from a sandboxed frame.
}