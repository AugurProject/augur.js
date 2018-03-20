#!/bin/bash

TAG=$(npm view augur-core version)
docker build . -t augurproject/dev-node-geth:core-$TAG -t augurproject/dev-node-geth:latest
docker run --rm --entrypoint cat augurproject/dev-node-geth:core-$TAG /augur.js/src/contracts/addresses.json > ./src/contracts/addresses.json
docker push augurproject/dev-node-geth:core-$TAG
docker push augurproject/dev-node-geth:latest
