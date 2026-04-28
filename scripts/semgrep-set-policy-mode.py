#!/usr/bin/env python3
"""Set Semgrep policy modes for all rules in a deployment.

- Custom rules (published from local YAML): always MODE_COMMENT
- Official rules matching blocklist: MODE_MONITOR
- Official rules not matching blocklist: MODE_COMMENT

Usage:
  SEMGREP_APP_TOKEN=<token> python3 semgrep-set-policy-mode.py \
    --org-slug brave_intl \
    --blocklist assets/opengrep_rules/blocklist.txt \
    --blocklist assets/opengrep_rules/blocklist-static.txt \
    assets/opengrep_rules/client/ assets/opengrep_rules/services/

Requires: Python 3.x with stdlib only (no pip dependencies).
"""
import glob
import json
import os
import re
import sys
import time
import urllib.request
import urllib.error

BASE_URL = "https://semgrep.dev/api/v1"
MODE_COMMENT = "MODE_COMMENT"
MODE_MONITOR = "MODE_MONITOR"
MAX_RETRIES = 5
INITIAL_BACKOFF = 1.0  # seconds


def api(method, path, token, body=None):
    url = f"{BASE_URL}{path}"
    data = json.dumps(body).encode() if body else None
    for attempt in range(MAX_RETRIES + 1):
        req = urllib.request.Request(
            url, data=data, method=method,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        )
        try:
            with urllib.request.urlopen(req) as resp:
                return json.loads(resp.read())
        except urllib.error.HTTPError as e:
            body_text = e.read().decode() if e.fp else ""
            if e.code in (429, 500, 502, 503, 504) and attempt < MAX_RETRIES:
                backoff = INITIAL_BACKOFF * (2 ** attempt)
                print(f"HTTP {e.code} on {method} {url} (attempt {attempt + 1}/{MAX_RETRIES + 1}), retrying in {backoff:.1f}s", file=sys.stderr)
                time.sleep(backoff)
                continue
            print(f"HTTP {e.code} on {method} {url}: {body_text}", file=sys.stderr)
            raise
        except (urllib.error.URLError, ConnectionError, TimeoutError) as e:
            if attempt < MAX_RETRIES:
                backoff = INITIAL_BACKOFF * (2 ** attempt)
                print(f"Network error on {method} {url} (attempt {attempt + 1}/{MAX_RETRIES + 1}): {e}, retrying in {backoff:.1f}s", file=sys.stderr)
                time.sleep(backoff)
                continue
            raise


def collect_rule_ids(directories):
    """Parse rule IDs from all YAML files in the given directories."""
    rule_ids = set()
    id_pattern = re.compile(r"^\s*-\s*id:\s*(.+)$", re.MULTILINE)
    for directory in directories:
        for yaml_path in glob.glob(os.path.join(directory, "**", "*.yaml"), recursive=True):
            with open(yaml_path) as f:
                content = f.read()
            for match in id_pattern.finditer(content):
                rule_id = match.group(1).strip()
                rule_ids.add(rule_id)
    return rule_ids


def load_blocklist_paths(blocklist_files):
    """Load blocklist files, return set of semgrep rule paths.

    Only extracts semgrep.dev/r/<path> entries (official rules).
    GitHub URLs are ignored (those reference custom rule sources).
    """
    paths = set()
    for bl_path in blocklist_files:
        if not os.path.exists(bl_path):
            print(f"Warning: blocklist not found: {bl_path}", file=sys.stderr)
            continue
        with open(bl_path) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                m = re.search(r"semgrep\.dev/r/(.+)$", line)
                if m:
                    paths.add(m.group(1))
    return paths


def get_deployment(token):
    data = api("GET", "/deployments", token)
    deployments = data.get("deployments", [])
    if not deployments:
        raise RuntimeError("No deployments found")
    dep = deployments[0]
    print(f"Deployment: {dep.get('name', '')} (id={dep['id']}, slug={dep.get('slug', '')})")
    return dep


def get_policies(token, deployment_id):
    data = api("GET", f"/deployments/{deployment_id}/policies", token)
    policies = data.get("policies", [])
    print(f"Found {len(policies)} policies")
    return policies


def get_rules(token, deployment_id, policy_id, page_size=2000):
    """Fetch all rules in a policy, handling pagination."""
    all_rules = []
    cursor = None
    while True:
        path = f"/deployments/{deployment_id}/policies/{policy_id}?pageSize={page_size}"
        if cursor:
            path += f"&cursor={cursor}"
        data = api("GET", path, token)
        rules = data.get("rules", [])
        all_rules.extend(rules)
        cursor = data.get("cursor")
        if not cursor or not rules:
            break
    return all_rules


def set_rule_mode(token, deployment_id, policy_id, rule_path, mode):
    body = {"rulePath": rule_path, "policyMode": mode}
    return api("PUT", f"/deployments/{deployment_id}/policies/{policy_id}", token, body)


def main():
    token = os.environ.get("SEMGREP_APP_TOKEN")
    if not token:
        print("Error: SEMGREP_APP_TOKEN not set", file=sys.stderr)
        sys.exit(1)

    directories = []
    blocklist_files = []
    dry_run = False
    org_slug = None
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == "--dry-run":
            dry_run = True
            i += 1
        elif args[i] == "--org-slug" and i + 1 < len(args):
            org_slug = args[i + 1]
            i += 2
        elif args[i] == "--blocklist" and i + 1 < len(args):
            blocklist_files.append(args[i + 1])
            i += 2
        else:
            directories.append(args[i])
            i += 1

    if not directories:
        print("Error: no rule directories specified", file=sys.stderr)
        print("Usage: semgrep-set-policy-mode.py [--org-slug SLUG] [--blocklist FILE ...] [--dry-run] <dir> [<dir>...]",
              file=sys.stderr)
        sys.exit(1)

    # Collect custom rule IDs from local YAML files
    local_ids = collect_rule_ids(directories)
    print(f"Local custom rule IDs: {len(local_ids)}")

    # Load blocklist (official rule paths only)
    blocklist = load_blocklist_paths(blocklist_files)
    print(f"Blocklist entries (official rules): {len(blocklist)}")

    # Get deployment
    deployment = get_deployment(token)
    deployment_id = deployment["id"]
    if not org_slug:
        org_slug = deployment.get("slug", "")
    if not org_slug:
        print("Error: could not determine org slug", file=sys.stderr)
        sys.exit(1)
    print(f"Org slug: {org_slug}")

    # Build set of custom rule paths for matching
    custom_paths = {f"{org_slug}.{rid}" for rid in local_ids}

    # Get SAST policy
    policies = get_policies(token, deployment_id)
    sast_policies = [p for p in policies if p.get("productType", "") != "PRODUCT_TYPE_SECRETS"]
    if not sast_policies:
        sast_policies = policies[:1]
    if not sast_policies:
        print("Error: no policies found", file=sys.stderr)
        sys.exit(1)

    policy = sast_policies[0]
    policy_id = policy["id"]
    policy_name = policy.get("name", policy_id)
    print(f"Using policy: {policy_name} (id={policy_id})")

    # Fetch all existing rules in the policy
    print("Fetching all rules in policy...")
    all_rules = get_rules(token, deployment_id, policy_id)
    print(f"Total rules in policy: {len(all_rules)}")

    # Also add custom rules that aren't in the policy yet
    existing_paths = {r["path"] for r in all_rules}
    missing_custom = custom_paths - existing_paths
    if missing_custom:
        print(f"Custom rules not yet in policy: {len(missing_custom)}")
        for path in missing_custom:
            all_rules.append({"path": path, "policyMode": "UNKNOWN", "source": "SOURCE_CUSTOM"})

    # Classify each rule
    to_update = []  # (rule_path, current_mode, target_mode)
    counts = {"custom_comment": 0, "official_comment": 0, "official_monitor": 0, "already_correct": 0}

    for rule in all_rules:
        path = rule["path"]
        current_mode = rule.get("policyMode", "UNKNOWN")

        if path in custom_paths or rule.get("source") == "SOURCE_CUSTOM":
            # Custom rules -> always MODE_COMMENT
            target = MODE_COMMENT
            if current_mode != target:
                to_update.append((path, current_mode, target))
                counts["custom_comment"] += 1
            else:
                counts["already_correct"] += 1
        elif path in blocklist:
            # Official rules in blocklist -> MODE_MONITOR
            target = MODE_MONITOR
            if current_mode != target:
                to_update.append((path, current_mode, target))
                counts["official_monitor"] += 1
            else:
                counts["already_correct"] += 1
        else:
            # Official rules not in blocklist -> MODE_COMMENT
            target = MODE_COMMENT
            if current_mode != target:
                to_update.append((path, current_mode, target))
                counts["official_comment"] += 1
            else:
                counts["already_correct"] += 1

    print(f"\nClassification:")
    print(f"  Custom rules -> COMMENT: {counts['custom_comment']}")
    print(f"  Official blocklisted -> MONITOR: {counts['official_monitor']}")
    print(f"  Official not blocklisted -> COMMENT: {counts['official_comment']}")
    print(f"  Already correct: {counts['already_correct']}")
    print(f"  Total to update: {len(to_update)}")

    if dry_run:
        print("\n[DRY RUN] No changes made")
        for path, current, target in to_update:
            print(f"  {path}: {current} -> {target}")
        return

    # Apply updates sequentially with a gap between calls.
    # Semgrep's UpdatePolicyRule has a race condition: concurrent PUT calls
    # read-modify-write the entire rules JSON array, so concurrent writers
    # clobber each other (HTTP 200 but changes lost). Serializing with a
    # small delay avoids the race until a batch endpoint is available.
    CALL_GAP = 0.05  # 50ms between calls
    updated = 0
    not_found = 0
    errors = 0

    print(f"\nApplying {len(to_update)} updates (sequential, {CALL_GAP * 1000:.0f}ms gap)...", flush=True)
    t0 = time.time()
    for done, (path, current, target) in enumerate(to_update, 1):
        try:
            set_rule_mode(token, deployment_id, policy_id, path, target)
            updated += 1
        except urllib.error.HTTPError as e:
            if e.code == 404:
                not_found += 1
            else:
                print(f"  ERROR {path}: HTTP {e.code}", file=sys.stderr, flush=True)
                errors += 1
        except Exception as e:
            print(f"  ERROR {path}: {e}", file=sys.stderr, flush=True)
            errors += 1

        if done % 50 == 0:
            elapsed = time.time() - t0
            rate = done / elapsed if elapsed > 0 else 0
            eta = (len(to_update) - done) / rate if rate > 0 else 0
            print(f"  Progress: {done}/{len(to_update)} ({rate:.1f}/s, ETA {eta:.0f}s) | ok={updated} err={errors} 404={not_found}", flush=True)

        if done < len(to_update):
            time.sleep(CALL_GAP)

    elapsed = time.time() - t0
    print(f"\nDone in {elapsed:.0f}s: {updated} updated, {not_found} not found, {errors} errors")
    if errors:
        sys.exit(1)


if __name__ == "__main__":
    main()
