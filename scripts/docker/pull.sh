#!/bin/bash

TAG=$(npm view augur-core version)

# list of docker images to pull
IMAGE_NAME=augurproject/dev-pop-geth
echo "docker pull $IMAGE_NAME:core-$TAG"
docker pull $IMAGE_NAME:core-$TAG

IMAGE_NAME=augurproject/dev-pop-normtime-geth
echo "docker pull $IMAGE_NAME:core-$TAG"
docker pull $IMAGE_NAME:core-$TAG

docker pull augurproject/dev-node-parity:latest
docker pull augurproject/dev-node-geth:latest




