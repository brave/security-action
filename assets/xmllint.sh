#!/bin/bash -e
# Absolute path to this script. /home/user/bin/foo.sh
SCRIPT=$(readlink -f "$0")
# Absolute path this script is in. /home/user/bin
SCRIPTPATH=$(dirname "$SCRIPT")
export SCRIPTPATH

# Only check SVGs
[[ "$1" == *".svg" ]] || exit 0

OUT=$(xmllint --dtdvalid "$SCRIPTPATH/dtd/svg11-secure-flat.dtd" --noout "$1" 2>&1) || {
    echo "$OUT"
    exit 1
}
echo "$OUT" | grep -v '^Document'
