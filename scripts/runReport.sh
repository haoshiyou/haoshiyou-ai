#!/bin/bash
# This script file runs report.ts to generate a new version of extracted result and see if it matches with what we have.
mkdir -p tmp
npx ts-node "./training/report.ts" "./training/testdata/2018-labeled-data.csv" "tmp/test_out.csv" "tmp/test_stats"
result=$(diff "./training/stats/stats" "tmp/test_stats" 2>&1)
if [ -z "${result}" ]; then
    echo "stats remain the same"
else
    echo "ERROR: stats report dismatch, run \"diff ./traininig/stats/stats tmp/test_stats\" for difference."
    exit 1
fi
