#!/bin/bash

yarn
zip -rq lambda.zip node_modules lib lambda.js package.json
aws lambda update-function-code --function-name arn:aws:lambda:us-east-1:274685854631:function:Heathcliff --zip-file fileb://lambda.zip
rm lambda.zip
