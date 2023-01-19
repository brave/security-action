#!/bin/bash -xe
# Absolute path to this script. /home/user/bin/foo.sh
SCRIPT=$(readlink -f $0)
# Absolute path this script is in. /home/user/bin
export SCRIPTPATH=`dirname $SCRIPT`

# Only check SVGs
[[ "$1" == *".svg" ]] || exit 0

xmllint --dtdvalid $SCRIPTPATH/dtd/svg11-secure-flat.dtd --noout "$1" 2>&1 | tee /dev/stderr | grep -v '^Document'