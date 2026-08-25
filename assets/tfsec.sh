#!/bin/bash -e
# Absolute path to this script. /home/user/bin/foo.sh
SCRIPT=$(readlink -f "$0")
# Absolute path this script is in. /home/user/bin
SCRIPTPATH=$(dirname "$SCRIPT")
export SCRIPTPATH

shopt -s nullglob
ARGS=()
for TFVARS in *.tfvars; do
    ARGS+=(--tfvars-file "$TFVARS")
done

tfsec "$1" "${ARGS[@]}" --format=json | jq -r -f "$SCRIPTPATH/tfsec.jq"
