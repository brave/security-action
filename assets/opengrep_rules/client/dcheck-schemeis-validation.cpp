// Test cases for dcheck-schemeis-validation rule

// SHOULD TRIGGER: DCHECK used as the only scheme/origin validation (incl. compound conditions)
// ruleid: dcheck-schemeis-validation
DCHECK(background_url.SchemeIs("chrome"));
// ruleid: dcheck-schemeis-validation
DCHECK(image_url.SchemeIsCryptographic());
// ruleid: dcheck-schemeis-validation
DCHECK(custom_url.has_host());
// ruleid: dcheck-schemeis-validation
DCHECK(value.SchemeIs("chrome") &&
       value.host() == ntp_background_images::kCustomWallpaperHost);

// SHOULD NOT TRIGGER: load-bearing validation or non-security DCHECKs
// ok: dcheck-schemeis-validation
if (!background_url.SchemeIs("chrome")) {
  callback.Run(false);
  return;
}
// ok: dcheck-schemeis-validation
DCHECK(background_url.is_valid());
// ok: dcheck-schemeis-validation
DCHECK_EQ(url.scheme(), "chrome");