#!/bin/bash -xe
# Absolute path to this script. /home/user/bin/foo.sh
SCRIPT=$(readlink -f $0)
# Absolute path this script is in. /home/user/bin
export SCRIPTPATH=`dirname $SCRIPT`
export GOPATH=$HOME/go
export PATH=$PATH:$GOROOT/bin:$GOPATH/bin

if [ -n "${GITHUB_BASE_REF+set}" ]; then
    reviewdog -reporter=github-pr-review -runners=semgrep,safesvg -conf="$SCRIPTPATH/reviewdog/reviewdog.yml" -tee
else
    find $SCRIPTPATH/../t3sts/ | sed "s|$SCRIPTPATH/../||g" | tr '\n' '\0' > $SCRIPTPATH/all_changed_files.txt
    GITHUB_BASE_REF=initial-commit reviewdog  -runners=semgrep,safesvg -conf="$SCRIPTPATH/reviewdog/reviewdog.yml"  -diff="git diff origin/$GITHUB_BASE_REF" -reporter=local -tee
fi

cat /dev/null semgrep.log safesvg.log > reviewdog.log
find reviewdog.log -type f -empty -delete
