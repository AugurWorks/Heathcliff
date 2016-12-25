FROM alpine

RUN apk add --no-cache nodejs

WORKDIR /usr/src/app

COPY package.json /usr/src/app
RUN npm install
COPY . /usr/src/app

CMD node message.js
