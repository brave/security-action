// Test cases for web-discovery-patterns-finddict-null-guard rule (scoped to patterns.cc)
// NOTE: this is a regression canary for the exact vulnerable identifier — it flags every
// direct payloads_dict->FindDict() use; after the null-guard fix the call site remains
// flagged and should be reviewed (or refactored) rather than silenced.

// SHOULD TRIGGER: optional dict dereferenced without a guard
// ruleid: web-discovery-patterns-finddict-null-guard
payloads_url_dict = payloads_dict->FindDict(i_str);

// SHOULD NOT TRIGGER: other dictionaries already have their own guards
// ok: web-discovery-patterns-finddict-null-guard
query_templates_dict->FindDict(i_str);