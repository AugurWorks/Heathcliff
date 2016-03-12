FROM alpine

RUN apk add --no-cache nodejs

WORKDIR /usr/src/app

COPY package.json /usr/src/app
RUN npm install
COPY . /usr/src/app

EXPOSE 3000

CMD node server.js