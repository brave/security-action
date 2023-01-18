#!/bin/bash -xe
pwd
tree -a
echo $RUNNER_TEMP
tree -a $RUNNER_TEMP
realpath "$0"
realpath -s "$0"
echo $ASSIGNEES