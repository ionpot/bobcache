const assert = require("assert");
const ifDef = require("utils/ifdef.js");
const List = require("utils/list.js");
const Prms = require("utils/promise.js");
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

const respond = (f) => (list) =>
	() => ifDef(Prms.resolveWith(f), Prms.stall)(list.shift());

const respondOnce = (f) => (x) =>
	respond(f)([x]);

exports.respondCode = respondOnce(Stream.respondCode);
exports.respondBody = respondOnce(Stream.respondBody);
exports.respondBodies = respond(Stream.respondBody);
exports.respondList = respond(List.applyTo(Stream.respondWith));

exports.responseObject = Stream.responseDumped;
