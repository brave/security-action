// Test cases for adblock-cache-read-no-integrity rule (scoped to ad_block*.cc)
// NOTE: canary — flags any raw cache read in ad-block code; integrity verification
// cannot be confirmed syntactically, so raw reads always require review.

// SHOULD TRIGGER: cache read-back without integrity verification
// ruleid: adblock-cache-read-no-integrity
auto bytes = base::ReadFileToBytes(path);
// ruleid: adblock-cache-read-no-integrity
manager.MaybeReadCachedDATFiles(callback);

// SHOULD NOT TRIGGER: reads routed through an integrity-verified helper
// ok: adblock-cache-read-no-integrity
auto verified = ReadDatCacheWithIntegrityCheck(path);
// ok: adblock-cache-read-no-integrity
std::optional<std::vector<uint8_t>> bundled = LoadBundledFilters();