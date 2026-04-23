#!/usr/bin/env python3
"""Set published Semgrep rules to a specified policy mode via the Semgrep API.

Only updates rules whose IDs match those found in the given YAML directories.

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


def matches_local_rule(rule_path, local_ids):
    """Check if a remote rule path corresponds to one of our local rule IDs.

    Published rules have paths like 'org-slug.rule-id'. We match if the
    path itself is a known ID, or the part after the last '.' is a known ID.
    """
    if rule_path in local_ids:
        return True
    # org-slug.rule-id format
    dot_idx = rule_path.find(".")
    if dot_idx != -1:
        suffix = rule_path[dot_idx + 1:]
        if suffix in local_ids:
            return True
    return False


def get_deployment_id(token):
    data = api("GET", "/deployments", token)
    deployments = data.get("deployments", [])
    if not deployments:
        raise RuntimeError("No deployments found")
    dep_id = deployments[0]["id"]
    dep_name = deployments[0].get("name", "")
    print(f"Deployment: {dep_name} (id={dep_id})")
    return dep_id


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
    api("PUT", f"/deployments/{deployment_id}/policies/{policy_id}", token, body)


def main():
    token = os.environ.get("SEMGREP_APP_TOKEN")
    if not token:
        print("Error: SEMGREP_APP_TOKEN not set", file=sys.stderr)
        sys.exit(1)

    target_mode = DEFAULT_MODE
    directories = []
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == "--mode" and i + 1 < len(args):
            target_mode = args[i + 1]
            i += 2
        else:
            directories.append(args[i])
            i += 1

    if not directories:
        print("Error: no rule directories specified", file=sys.stderr)
        print("Usage: semgrep-set-policy-mode.py [--mode MODE] <dir> [<dir>...]", file=sys.stderr)
        sys.exit(1)

    local_ids = collect_rule_ids(directories)
    if not local_ids:
        print("Warning: no rule IDs found in specified directories", file=sys.stderr)
        sys.exit(0)

    print(f"Target mode: {target_mode}")
    print(f"Local rule IDs ({len(local_ids)}): {', '.join(sorted(local_ids))}")

    deployment_id = get_deployment_id(token)
    policies = get_policies(token, deployment_id)

    updated = 0
    skipped = 0
    ignored = 0
    errors = 0

    for policy in policies:
        policy_id = policy["id"]
        policy_name = policy.get("name", policy_id)
        print(f"\nPolicy: {policy_name} (id={policy_id})")

        rules = get_rules(token, deployment_id, policy_id)
        print(f"  Total rules: {len(rules)}")

        for rule in rules:
            path = rule["path"]
            if not matches_local_rule(path, local_ids):
                ignored += 1
                continue
            current_mode = rule.get("policyMode", "UNKNOWN")
            if current_mode == target_mode:
                skipped += 1
                continue
            try:
                set_rule_mode(token, deployment_id, policy_id, path, target_mode)
                print(f"  {path}: {current_mode} -> {target_mode}")
                updated += 1
            except Exception as e:
                print(f"  ERROR {path}: {e}", file=sys.stderr)
                errors += 1

    print(f"\nDone: {updated} updated, {skipped} already correct, {ignored} not ours, {errors} errors")
    if errors:
        sys.exit(1)


if __name__ == "__main__":
    main()
