#!/bin/bash -e
# Absolute path to this script. /home/user/bin/foo.sh
SCRIPT=$(readlink -f $0)
# Absolute path this script is in. /home/user/bin
export SCRIPTPATH=`dirname $SCRIPT`

ARGS=""
if ls *.tfvars 2> /dev/null; then
    for TFVARS in *.tfvars; do
        ARGS+="--tfvars-file $TFVARS "
    done
fi

tfsec "$1" $ARGS --format=json | jq -r -f "$SCRIPTPATH/tfsec.jq"
