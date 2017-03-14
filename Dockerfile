FROM alpine

RUN apk add --no-cache nodejs git

WORKDIR /usr/src/app

COPY package.json /usr/src/app
RUN npm install
COPY . /usr/src/app

CMD node message.js
