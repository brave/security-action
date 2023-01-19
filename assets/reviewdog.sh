#!/bin/bash -xe
# Absolute path to this script. /home/user/bin/foo.sh
SCRIPT=$(readlink -f $0)
# Absolute path this script is in. /home/user/bin
export SCRIPTPATH=`dirname $SCRIPT`
reviewdog -reporter=github-pr-review -runners=semgrep,safesvg -conf="$SCRIPTPATH/reviewdog/reviewdog.yml" -tee
cat /dev/null semgrep.log safesvg.log > reviewdog.log
find reviewdog.log -type f -empty -delete