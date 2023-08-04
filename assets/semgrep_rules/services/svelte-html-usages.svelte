<!-- ruleid: svelte-html-usages -->
{@html trigger}
<!-- ruleid: svelte-html-usages -->
{@html   
   i18n.replace("a", "z")
}

<!-- ok: svelte-html-usages -->
{@html safeTranslate(
    i18n, key, {}
)}
<!-- ok: svelte-html-usages -->
{@html MyIcon}