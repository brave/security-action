---
name: client/browser-dependency-inversion
rubric: correctness
severity: nit
languages: [cpp]
---

**Rule.** There are several global functions that facilitate dependency inversion. It will not be possible to call them from modularized features (no dependency cycles), and their usage in non-modularized features is considered a red flag Don't use Browser*. This is functionally a container of hundreds of other pointers. It is impossible to specify dependencies, since Browser* functionally depends on everything. Instead, pass in the relevant pointers, e.g. Profile*, FooFeatureController, etc References: - https://chromium.googlesource.com/chromium/src/+/main/docs/chrome_browser_design_principles.md#structure_modularity

**Why.** See https://chromium.googlesource.com/chromium/src/+/main/docs/chrome_browser_design_principles.md#structure_modularity. Ported from opengrep rule `browser-dependency-inversion` (client/browser-dependency-inversion.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `browser-dependency-inversion` (metavariables start with `$`):

- `$FUNC(...)`
- `^(chrome::)?(FindTabbedBrowser|FindAnyBrowser|FindBrowserWithProfile|FindAllTabbedBrowsersWithProfile|FindAllBrowsersWithProfile|FindBrowserWithID|FindBrowserWithWindow|FindBrowserWithActiveWindow|FindBrowserWithTab|FindBrowserWithGroup|FindBrowserWithUiElementContext|FindLastActiveWithProfile|FindLastActive|BrowserView::GetBrowserViewForNativeWindow|BrowserView::FindBrowserWindowWithWebContents)$`
- `$RETURN $FUNC(..., Browser* $BROWSER, ...) { ... }`
