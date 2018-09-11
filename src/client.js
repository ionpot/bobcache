const http = require("http");
const https = require("https");
const target = require("../config.js").target;

const getClient = () =>
	target.tls ? https : http;

const getOpts = (req) =>
	({
		hostname: target.host,
		port: target.port,
		method: req.method,
		path: req.url,
		headers: req.headers
	});

const makeReq = (req, done, fail) =>
	getClient()
		.request(getOpts(req), done)
		.on("error", fail);

exports.forward = (req) =>
	new Promise((done, fail) =>
		req.pipe(makeReq(req, done, fail)));

exports.get = (req) =>
	new Promise((done, fail) =>
		makeReq(req, done, fail).end());
