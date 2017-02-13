#!/bin/sh

version=`node -e "console.log(require('./package.json').version);"`

echo "Building container v$version$1"
docker build -t heathcliff .

echo "Tagging version $version$1"
docker tag heathcliff 274685854631.dkr.ecr.us-east-1.amazonaws.com/heathcliff:$version$1
docker tag heathcliff 274685854631.dkr.ecr.us-east-1.amazonaws.com/heathcliff:latest$1
docker push 274685854631.dkr.ecr.us-east-1.amazonaws.com/heathcliff:$version$1
docker push 274685854631.dkr.ecr.us-east-1.amazonaws.com/heathcliff:latest$1
docker rmi heathcliff 274685854631.dkr.ecr.us-east-1.amazonaws.com/heathcliff:latest$1
