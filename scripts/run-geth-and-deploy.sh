#!/bin/bash

cd /
./start.sh &

cd /augur.js

echo "Resting for a bit"
sleep 10s

curl --data '{"method":"net_version","params":[],"id":67,"jsonrpc":"2.0"}' -H "Content-Type: application/json" -X POST localhost:8545

USE_NORMAL_TIME=false node scripts/dp deploy

# RUN $(ps aux | grep -ie geth | awk '{print "kill -9" $2}')
