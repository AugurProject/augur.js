#!/bin/bash

TAG=core-$(node scripts/package-version.js augur-core)
docker push augurproject/dev-pop-geth:$TAG
docker push augurproject/dev-pop-geth:latest
docker push augurproject/dev-pop-normtime-geth:$TAG
docker push augurproject/dev-pop-normtime-geth:latest
