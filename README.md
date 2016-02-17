# Neural Net
A small web server wrapping a neural net.

## Usage
- Run `npm install`
- Run `node server.js`
- Go to [http://localhost:3000](http://localhost:3000)

## Testing
Run test data through the web server by starting it up and then also running `node test/example-request.js`

## Docker
Build a Docker container with `docker build -t node-net .`.

Run the container with `docker run -d -p 3000:3000 node-net` and navigate to [http://localhost:3000](http://localhost:3000).
