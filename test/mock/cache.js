const assert = require("assert");
const Func = require("utils/func.js");
const List = require("utils/list.js");
const Stream = require("utils/stream.js");
const Header = require("./header.js");
const MockStream = require("./stream.js");

const equal = assert.strictEqual;
const deepEq = assert.deepStrictEqual;

const toBody = (code, req) =>
	String(code) + req.url;

exports.assertEntry = (actual, res, req) =>
	Stream.read(actual)
		.then(function (body) {
			const code = actual.statusCode;
			equal(code, res.statusCode);
			deepEq(actual.headers, Header.text);
			equal(body, toBody(code, req));
		});

exports.request = (key = "/") =>
	MockStream.createGET(key);

exports.response = function (req) {
	const code = Math.floor(Math.random() * 1000);
	return MockStream.respondWith(code, toBody(code, req));
};

const toEntry = (body, code = 200, headers = Header.text) =>
	({body, statusCode: code, headers});

exports.noEntry = () =>
	(key) => Promise.reject(key);

exports.returnEntry = (body) =>
	() => Promise.resolve(toEntry(body));

exports.stall = () =>
	() => new Promise(Func.empty);

const store = (f) =>
	() => (actual) => void f(actual);

exports.expectEntry = (body, done) =>
	store(function (actual) {
		deepEq(actual, toEntry(body));
		done();
	});

exports.expectEntries = (bodies, done) =>
	store(function (actual) {
		deepEq(actual, toEntry(bodies.shift()));
		List.ifEmpty(done)(bodies);
	});

exports.ignoreStore = () =>
	store(Func.empty);
