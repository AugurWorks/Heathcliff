#!/bin/sh

version=`node -e "console.log(require('./package.json').version);"`

echo "Building container v$version$1"
docker build -t node-net .

echo "Tagging version $version$1"
docker tag node-net 274685854631.dkr.ecr.us-east-1.amazonaws.com/node-net:$version$1
docker tag node-net 274685854631.dkr.ecr.us-east-1.amazonaws.com/node-net:latest$1
docker push 274685854631.dkr.ecr.us-east-1.amazonaws.com/node-net:$version$1
docker push 274685854631.dkr.ecr.us-east-1.amazonaws.com/node-net:latest$1
docker rmi node-net 274685854631.dkr.ecr.us-east-1.amazonaws.com/node-net:latest$1
