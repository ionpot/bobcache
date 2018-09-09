const http = require("http");
const config = require("./config.json");
const handle = require("./src/handle.js");

const port = Number(process.argv[2]) || config.port;

const print = () =>
	console.log("Listening port", port);

http.createServer(handle(config)).listen(port, print);
