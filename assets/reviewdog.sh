#!/bin/bash -xe
# Absolute path to this script. /home/user/bin/foo.sh
SCRIPT=$(readlink -f $0)
# Absolute path this script is in. /home/user/bin
export SCRIPTPATH=`dirname $SCRIPT`
export GOPATH=$HOME/go
export PATH=$PATH:$GOROOT/bin:$GOPATH/bin

RUNNERS="safesvg tfsec semgrep brakeman"

if [ -n "${GITHUB_BASE_REF+set}" ]; then
    for runner in $RUNNERS; do
        reviewdog -reporter=local -runners=$runner -conf="$SCRIPTPATH/reviewdog/reviewdog.yml" -diff="git diff origin/$GITHUB_BASE_REF" > $runner.log
    done

    for runner in $RUNNERS; do
        cat $runner.log | reviewdog -reporter=github-pr-review -efm='%f:%l: %m'
        cat $runner.log >> reviewdog.log
    done
else
    find $SCRIPTPATH/../t3sts/ | sed "s|$SCRIPTPATH/../||g" | tr '\n' '\0' > $SCRIPTPATH/all_changed_files.txt
    GITHUB_BASE_REF=initial-commit reviewdog  -runners=semgrep,safesvg -conf="$SCRIPTPATH/reviewdog/reviewdog.yml"  -diff="git diff origin/$GITHUB_BASE_REF" -reporter=local -tee
fi

find reviewdog.log -type f -empty -delete