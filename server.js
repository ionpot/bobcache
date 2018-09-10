const http = require("http");
const config = require("./config.json");
const handle = require("./src/handle.js");

const routes = config.target.routes;
const port = Number(process.argv[2]) || config.port;

const print = () =>
	console.log("Listening port", port);

http.createServer(handle(routes)).listen(port, print);
