#!/usr/bin/env python3
"""Set published Semgrep rules to a specified policy mode via the Semgrep API.

Only updates rules whose IDs match those found in the given YAML directories.
Constructs rule paths as '<org_slug>.<rule_id>' and calls the UpdatePolicy API
for each one, which adds the rule to the policy if not already present.

Usage:
  SEMGREP_APP_TOKEN=<token> python3 semgrep-set-policy-mode.py \
    --mode MODE_COMMENT \
    assets/opengrep_rules/client/ assets/opengrep_rules/services/

Requires: Python 3.x with stdlib only (no pip dependencies).
"""
import glob
import json
import os
import re
import sys
import urllib.request
import urllib.error

BASE_URL = "https://semgrep.dev/api/v1"
DEFAULT_MODE = "MODE_COMMENT"


def api(method, path, token, body=None):
    url = f"{BASE_URL}{path}"
    data = json.dumps(body).encode() if body else None
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
        print(f"HTTP {e.code} on {method} {url}: {body_text}", file=sys.stderr)
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


def set_rule_mode(token, deployment_id, policy_id, rule_path, mode):
    body = {"rulePath": rule_path, "policyMode": mode}
    return api("PUT", f"/deployments/{deployment_id}/policies/{policy_id}", token, body)


def main():
    token = os.environ.get("SEMGREP_APP_TOKEN")
    if not token:
        print("Error: SEMGREP_APP_TOKEN not set", file=sys.stderr)
        sys.exit(1)

    target_mode = DEFAULT_MODE
    directories = []
    dry_run = False
    org_slug = None
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == "--mode" and i + 1 < len(args):
            target_mode = args[i + 1]
            i += 2
        elif args[i] == "--dry-run":
            dry_run = True
            i += 1
        elif args[i] == "--org-slug" and i + 1 < len(args):
            org_slug = args[i + 1]
            i += 2
        else:
            directories.append(args[i])
            i += 1

    if not directories:
        print("Error: no rule directories specified", file=sys.stderr)
        print("Usage: semgrep-set-policy-mode.py [--mode MODE] [--org-slug SLUG] [--dry-run] <dir> [<dir>...]",
              file=sys.stderr)
        sys.exit(1)

    local_ids = collect_rule_ids(directories)
    if not local_ids:
        print("Warning: no rule IDs found in specified directories", file=sys.stderr)
        sys.exit(0)

    print(f"Target mode: {target_mode}{' (dry run)' if dry_run else ''}")
    print(f"Local rule IDs ({len(local_ids)}): {', '.join(sorted(local_ids))}")

    deployment = get_deployment(token)
    deployment_id = deployment["id"]

    # Use deployment slug as org slug if not explicitly provided
    if not org_slug:
        org_slug = deployment.get("slug", "")
    if not org_slug:
        print("Error: could not determine org slug from deployment", file=sys.stderr)
        sys.exit(1)
    print(f"Org slug: {org_slug}")

    policies = get_policies(token, deployment_id)
    # Use the first SAST policy (Global Policy), skip secrets policies
    sast_policies = [p for p in policies if p.get("productType", "") != "PRODUCT_TYPE_SECRETS"]
    if not sast_policies:
        sast_policies = policies[:1]  # fallback to first policy

    if not sast_policies:
        print("Error: no policies found", file=sys.stderr)
        sys.exit(1)

    policy = sast_policies[0]
    policy_id = policy["id"]
    policy_name = policy.get("name", policy_id)
    print(f"Using policy: {policy_name} (id={policy_id})")

    updated = 0
    skipped = 0
    errors = 0

    for rule_id in sorted(local_ids):
        rule_path = f"{org_slug}.{rule_id}"
        if dry_run:
            print(f"  [DRY RUN] {rule_path} -> {target_mode}")
            updated += 1
            continue
        try:
            set_rule_mode(token, deployment_id, policy_id, rule_path, target_mode)
            print(f"  {rule_path}: -> {target_mode}")
            updated += 1
        except urllib.error.HTTPError as e:
            if e.code == 404:
                print(f"  {rule_path}: not found in registry (skipped)")
                skipped += 1
            else:
                print(f"  ERROR {rule_path}: HTTP {e.code}", file=sys.stderr)
                errors += 1
        except Exception as e:
            print(f"  ERROR {rule_path}: {e}", file=sys.stderr)
            errors += 1

    print(f"\nDone: {updated} updated, {skipped} skipped, {errors} errors")
    if errors:
        sys.exit(1)


if __name__ == "__main__":
    main()
