function testWebUIOriginEncoding() {
  const param = "param=test param with spaces and URL https://example.com";
  const unencodedUrl = "https://example.com"
  const hash = "#section1";
  const path = "/path/to/resource";

  // ok: web-ui-origin-encoding
  const faviconUrl = "chrome://favicon";

  // ok: web-ui-origin-encoding
  const faviconUrl2 = "chrome://favicon/";

    // ok: web-ui-origin-encoding
  const faviconUrl3 = `chrome://favicon/size/64@1x/${unencodedUrl}`;

  // ok: web-ui-origin-encoding
  const staticUrl = "chrome://brave/settings";

  // ok: web-ui-origin-encoding
  const staticUrlWithHash = "chrome://brave/settings#general";

  // ok: web-ui-origin-encoding
  const goodPathUrl = `brave://wallet${path}`; //should ignore as it's a common approach for wallet routing

  // ok: web-ui-origin-encoding
  const goodUrl1 = `chrome://brave/${encodeURIComponent(param + param)}`;

  // ok: web-ui-origin-encoding
  const goodUrl2 = "chrome://brave/settings?" + encodeURIComponent(param) + encodeURIComponent(hash);

  // ok: web-ui-origin-encoding
  const goodUrl3 = `chrome://brave-rewards/${path}?param=${encodeURIComponent(param)}`;

  // ok: web-ui-origin-encoding
  const goodUrl4 = `chrome://brave-rewards` + path + `?param=${encodeURIComponent(param)}`;

  // ruleid: web-ui-origin-encoding
  const badFaviconUrl3 = `chrome://favicon2?url=${unencodedUrl}`; // favicon2 needs to be URI encoded still

  // ruleid: web-ui-origin-encoding
  const partialEncodingUrl = `chrome://brave/${encodeURIComponent(
    param
  )}${hash}`; // should still trigger as 'hash' isn't encoded

  // ruleid: web-ui-origin-encoding
  const multiParamEncoded = `chrome://brave/settings?param1=${encodeURIComponent(
    param
  )}&param2=${encodeURIComponent(path)}`; // false positive, but too complex to handle this case so can just be manually checked

  // ruleid: web-ui-origin-encoding
  const badBraveWalletUrl = `brave://wallet/${param}`

  // ruleid: web-ui-origin-encoding
  const badUrl1 = `chrome://brave/${param}`; // should still throw because it's unencoded data

  // ruleid: web-ui-origin-encoding
  const badUrl2 = "chrome://brave/settings?" + param + hash;

  // ruleid: web-ui-origin-encoding
  const badUrl3 = `chrome://brave-rewards${path}?param=${param}`;
}
