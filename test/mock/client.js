const assert = require("assert");
const Func = require("utils/func.js");
const List = require("utils/list.js");
const Stream = require("./stream.js");

const equal = assert.strictEqual;

exports.requestHome = () =>
	Stream.createGET("/");

exports.expectResponse = (body, done) =>
	Stream.responseBuffered(function (actual) {
		equal(actual, body);
		done();
	});

exports.expectResponseCode = (code, done) =>
	Stream.responseEnd(function (res) {
		equal(res.statusCode, code);
		done();
	});

const respondFn = (f) =>
	() => Promise.resolve(f());

const respond = (x) =>
	respondFn(Func.map(x));

exports.respondCode = (code) =>
	respond(Stream.respondCode(code));

exports.respondBody = (body) =>
	respond(Stream.respondBody(body));

exports.respondBodies = (bodies) =>
	respondFn(() => Stream.respondBody(bodies.shift()));

exports.respondList = (list) =>
	respondFn(() =>
		List.applyTo(Stream.respondWith, list.shift()));

exports.responseObject = Stream.responseDumped;
