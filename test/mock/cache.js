const assert = require("assert");
const Func = require("utils/func.js");
const List = require("utils/list.js");
const Header = require("./header.js");

const equal = assert.deepStrictEqual;

const toEntry = (body, code = 200, headers = Header.text) =>
	({body, statusCode: code, headers});

exports.noEntry = () =>
	(key) => Promise.reject(key);

exports.returnEntry = (body) =>
	() => Promise.resolve(toEntry(body));

exports.stall = () =>
	() => new Promise(Func.empty);

const store = (f) =>
	(key) => (actual) => void f(actual);

exports.expectEntry = (body, done) =>
	store(function (actual) {
		equal(actual, toEntry(body));
		done();
	});

exports.expectEntries = (bodies, done) =>
	store(function (actual) {
		equal(actual, toEntry(bodies.shift()));
		List.ifEmpty(done)(bodies);
	});

exports.ignoreStore = () =>
	store(Func.empty);
