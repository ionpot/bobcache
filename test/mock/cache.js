const assert = require("assert");
const Func = require("utils/func.js");
const List = require("utils/list.js");

const equal = assert.strictEqual;

const cacheGet = (f) =>
	() => f();

const cacheGetPromise = (f) =>
	cacheGet(() => new Promise(f));

exports.noEntry = () =>
	cacheGet(Promise.reject);

exports.returnEntry = (body) =>
	cacheGetPromise(Func.map(body));

exports.noReturnEntry = () =>
	cacheGetPromise(Func.empty);

const cacheSet = (f) =>
	(conf, key, actual) =>
		new Promise(function (done) {
			f(actual);
			done();
		});

exports.expectEntry = (value, done) =>
	cacheSet(function (actual) {
		equal(actual, value);
		done();
	});

exports.expectEntries = (values, done) =>
	cacheSet(function (actual) {
		equal(actual, values.shift());
		List.ifEmpty(done, values);
	});

exports.ignoreSet = () =>
	cacheSet(Func.empty);
