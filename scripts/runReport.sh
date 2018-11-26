#!/bin/bash
ts-node "../report.ts" "../testdata/labeling-data-10252018205253_Done.csv" "../tmp/test_out.csv" "../tmp/test_stats"
result=$(diff "../stats/stats" "../tmp/test_stats" 2>&1)
if [ -z "${result}" ]; then
    echo "correct file"
else
    echo "ERROR: stats report dismatch"
    exit 1
fi
