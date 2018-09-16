const Func = require("utils/func.js");
const Stream = require("utils/stream.js");
const Header = require("./header.js");

function makeReq(method, path) {
	const req = Stream.emptyReadable();
	req.method = method;
	req.url = path;
	return req;
}

exports.createGET = (path) =>
	makeReq("GET", path);

function makeResInbound(code, body) {
	const res = Stream.readableWith(body);
	res.statusCode = code;
	res.headers = Header.text;
	return res;
}

exports.respondBody = (body) =>
	makeResInbound(200, body);

exports.respondCode = (code) =>
	makeResInbound(code, "");

exports.respondWith = makeResInbound;

function makeResOutbound(done) {
	const res = Stream.writableBuffered(done);
	res.writeHead = function (code, headers) {
		res.statusCode = code;
		res.headers = headers;
	};
	return res;
}

exports.responseBuffered = makeResOutbound;
exports.responseEnd = function (done) {
	const res = makeResOutbound(() => done(res));
	return res;
};
exports.responseDumped = () =>
	makeResOutbound(Func.empty);
