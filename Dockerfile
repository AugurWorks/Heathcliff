FROM node:alpine

RUN apk add --no-cache git

WORKDIR /usr/src/app

COPY package.json /usr/src/app
COPY yarn.lock /usr/src/app

RUN yarn

COPY . /usr/src/app

CMD node message.js
