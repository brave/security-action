#!/bin/bash -xe
# Absolute path to this script. /home/user/bin/foo.sh
SCRIPT=$(readlink -f $0)
# Absolute path this script is in. /home/user/bin
export SCRIPTPATH=`dirname $SCRIPT`
export GOPATH=$HOME/go
export PATH=$PATH:$GOROOT/bin:$GOPATH/bin

RUNNERS="safesvg tfsec semgrep brakeman npm-audit pip-audit"

if [ -n "${GITHUB_BASE_REF+set}" ]; then
    for runner in $RUNNERS; do
        reviewdog -reporter=local -runners=$runner -conf="$SCRIPTPATH/reviewdog/reviewdog.yml" -diff="git diff origin/$GITHUB_BASE_REF" > $runner.log
    done

    for runner in $RUNNERS; do
        if [[ -f "$runner.log" ]]; then
            unset SHOULDSLEEP
            split -l 30 $runner.log
            for f in $(find . -name 'x??'); do
                if [ -z ${SHOULDSLEEP+x} ]; then
                    SHOULDSLEEP=1
                else
                    echo Sleeping
                    sleep 10
                fi
                cat $f | reviewdog -reporter=github-pr-review -efm='%f:%l: %m' \
                || cat $f >> reviewdog.fail.log
                cat $f >> reviewdog.log
                wc -l $f
                rm $f
            done
        fi
    done

    if [[ -f "reviewdog.fail.log" ]]; then
        sleep 10
        tac reviewdog.fail.log | reviewdog -reporter=github-pr-review -efm='%f:%l: %m' \
            || cat $f >> reviewdog.fail2.log
    fi

    if [[ -f "reviewdog.fail2.log" ]]; then
        set +x
        echo -e '\033[0;31mThis action encountered an error while reporting the following findings via the Github API:'
        cat reviewdog.fail2.log | sed 's/^/\x1B[0;34m/'
        echo -e '\033[0;31mThe failure of this action should not prevent you from merging your PR. Please report this failure to the maintainers of https://github.com/brave/security-action \033[0m'
        exit 1
    fi
else
    find $SCRIPTPATH/../t3sts/ | sed "s|$SCRIPTPATH/../||g" | tr '\n' '\0' > $SCRIPTPATH/all_changed_files.txt
    GITHUB_BASE_REF=initial-commit reviewdog  -runners=semgrep,safesvg -conf="$SCRIPTPATH/reviewdog/reviewdog.yml"  -diff="git diff origin/$GITHUB_BASE_REF" -reporter=local -tee
fi

find reviewdog.log -type f -empty -delete || true