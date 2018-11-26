#!/bin/bash
set -e

[ -n "$NO_HOOK" ] && exit 0
echo "start pre-push hook"
ts-node "report.ts" "testdata/labeling-data-10252018205253_Done.csv" "tmp/te st_out.csv" "stats/stats"
git add "stats/stats"
git commit -m "update report"
git push

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