// Test cases for gurl-domainis-allowlist rule (scoped to brave_rewards/content/*.cc)

// SHOULD TRIGGER: suffix-match allowlist decision
// ruleid: gurl-domainis-allowlist
return referrer_url.DomainIs(host_piece);
// ruleid: gurl-domainis-allowlist
if (redirect_url.DomainIs("uphold.com")) {
  allow = true;
}

// SHOULD NOT TRIGGER: exact-host comparison
// ok: gurl-domainis-allowlist
if (referrer_url.host() == "uphold.com") {
  allow = true;
}
// ok: gurl-domainis-allowlist
bool same = referrer_url.spec() == allowed_referrer.spec();