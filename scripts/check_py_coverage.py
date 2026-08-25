"""Enforce the Python coverage gate: >=80% lines AND >=80% branches.

Reads the coverage.json produced by `coverage json` and exits non-zero
when either metric falls below the gate. Mirrors the JS c8 gate
(--lines 80 --branches 80) in package.json.
"""
import json
import sys
from pathlib import Path

GATE = 80.0


def main():
    data = json.loads(Path('coverage.json').read_text())
    totals = data['totals']

    lines = (
        totals['covered_lines'] / totals['num_statements'] * 100
        if totals['num_statements'] else 100.0
    )
    branches = (
        totals['covered_branches'] / totals['num_branches'] * 100
        if totals['num_branches'] else 100.0
    )

    print(f'Python coverage: lines {lines:.2f}%, branches {branches:.2f}%')

    failed = False
    if lines < GATE:
        print(f'FAIL: line coverage {lines:.2f}% is below the {GATE}% gate')
        failed = True
    if branches < GATE:
        print(f'FAIL: branch coverage {branches:.2f}% is below the {GATE}% gate')
        failed = True

    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
