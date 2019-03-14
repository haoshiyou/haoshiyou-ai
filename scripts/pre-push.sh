#!/bin/bash
# Ref to wechaty pre-push https://raw.githubusercontent.com/Chatie/wechaty/master/scripts/pre-push.sh
set -e

[ -n "$NO_HOOK" ] && exit 0
echo "start pre-push hook"

ts-node "report.ts" "testdata/labeling-data-10252018205253_Done.csv" "tmp/test_out.csv" "stats/stats"
result=$(git diff "stats/stats" 2>&1)
[ ! -z "${result}" ] && {
  echo "different stats file, commiting now..."
  git add "stats/stats"
  git commit -m "update report" 
}
NO_HOOK=1 git push

cat <<'_STR_'
  ____ _ _        ____            _
 / ___(_) |_     |  _ \ _   _ ___| |__
| |  _| | __|    | |_) | | | / __| '_ \
| |_| | | |_     |  __/| |_| \__ \ | | |
 \____|_|\__|    |_|    \__,_|___/_| |_|

 ____                              _ _
/ ___| _   _  ___ ___ ___  ___  __| | |
\___ \| | | |/ __/ __/ _ \/ _ \/ _` | |
 ___) | |_| | (_| (_|  __/  __/ (_| |_|
|____/ \__,_|\___\___\___|\___|\__,_(_)

_STR_

echo
echo
echo
echo " ### Npm verion bumped and pushed by inner push inside hook pre-push ###"
echo " ------- vvvvvvv outer push will be canceled, never mind vvvvvvv -------"
echo
echo
echo
echo "PRE-PUSH HOOK PASSED"
echo
exit 999