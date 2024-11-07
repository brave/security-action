#!/bin/bash -xe
# Absolute path to this script. /home/user/bin/foo.sh
SCRIPT=$(readlink -f $0)
# Absolute path this script is in. /home/user/bin
export SCRIPTPATH=`dirname $SCRIPT`
export GOPATH=$HOME/go
export PATH=$PATH:$GOROOT/bin:$GOPATH/bin
export SEC_ACTION_DEBUG=$SEC_ACTION_DEBUG
export ASSIGNEES=$(echo "$ASSIGNEES" | sed 's|\([^ ]\)|@\1|' | tr -s '\n' ' ')
export GITHUB_REPORTER=github-pr-review

RUNNERS="safesvg tfsec semgrep sveltegrep npm-audit pip-audit fickling" # disabled: brakeman
# redefine RUNNERS with $1 if it is set
if [ -n "$1" ]; then
    RUNNERS=$1
fi
# if GITHUB_OUTPUT is not set, set it to /dev/stdout
if [ -z "$GITHUB_OUTPUT" ]; then
    GITHUB_OUTPUT=/dev/stdout
    GITHUB_REPORTER=local
fi


if [ -n "${GITHUB_BASE_REF+set}" ]; then
    for runner in $RUNNERS; do
        SCRIPTPATH=$SCRIPTPATH reviewdog -reporter=local -runners=$runner -conf="$SCRIPTPATH/reviewdog/reviewdog.yml" -filter-mode=nofilter > $runner.log 2>> reviewdog.log || true
        grep -H "" reviewdog.$runner.stderr.log >> reviewdog.fail.log || true
        [[ ${SEC_ACTION_DEBUG:-false} == 'true' ]] && grep -H "" reviewdog.$runner.stderr.log || true
    done

    for runner in $RUNNERS; do
        # replace anything that has not the number in the beginning of the line with zero
        cat $runner.log | grep -E '[^:]+: ' > $runner.log.noline || true
        cat $runner.log | grep -v -E '[^:]+: ' > $runner.log.line || true
        
        cat $runner.log.line | reviewdog -reporter=$GITHUB_REPORTER -efm='%f:%l: %m' \
          || cat $runner.log.line >> reviewdog.fail.log
        cat $runner.log.noline | reviewdog -reporter=$GITHUB_REPORTER -efm='%f: %m' -filter-mode=nofilter \
          || cat $runner.log.noline >> reviewdog.fail.log

        grep -H "" $runner.log >> reviewdog.log || true
        echo -n "$runner: "
        echo "${runner//-/_}_count=$(grep -c "^" $runner.log)" >> $GITHUB_OUTPUT || true
        [[ ${SEC_ACTION_DEBUG:-false} == 'true' ]] && grep -H "" $runner.log || true
    done

else
    git ls-files | tr '\n' '\0' > $SCRIPTPATH/all_changed_files.txt
    reviewdog \
      -runners=$(echo "$RUNNERS" | tr ' ' ',') \
      -conf="$SCRIPTPATH/reviewdog/reviewdog.yml"  \
      -filter-mode=nofilter \
      -reporter=local \
      -tee \
      | sed 's/<br><br>Cc @brave\/sec-team[ ]*//' \
      | tee reviewdog.log
    # TODO: in the future send reviewdog.log to a database and just print out errors with
    # [[ ${SEC_ACTION_DEBUG:-false} == 'true' ]] && somethingsomething
    # TODO: fix brakeman on full-scan
    grep -H "" reviewdog.*.stderr.log | grep -v "reviewdog.brakeman.stderr.log:" >> reviewdog.fail.log || true
    for runner in $RUNNERS; do
      echo "${runner//-/_}_count=$(grep -c ": \[${runner}\] .*$" reviewdog.log)" >> $GITHUB_OUTPUT || true
    done
fi

cat reviewdog.log | grep 'failed with zero findings: The command itself failed' >> reviewdog.fail.log || true

echo "findings=$(cat reviewdog.log | grep '^[A-Z]:[^:]*:' | wc -l)" >> $GITHUB_OUTPUT

sed -i '/^$/d' reviewdog.log reviewdog.fail.log
find reviewdog.log -type f -empty -delete
find reviewdog.fail.log -type f -empty -delete
