#!/bin/bash -e
set -o pipefail
# Absolute path to this script. /home/user/bin/foo.sh
SCRIPT=$(readlink -f "$0")
# Absolute path this script is in. /home/user/bin
SCRIPTPATH=$(dirname "$SCRIPT")
export SCRIPTPATH

# Only check SVGs
[[ "$1" == *".svg" ]] || exit 0

xmllint --dtdvalid "$SCRIPTPATH/dtd/svg11-secure-flat.dtd" --noout "$1" 2>&1 | { grep -v '^Document' || true; }
