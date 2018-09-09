const assert = require("assert");
const Func = require("utils/func.js");
const List = require("utils/list.js");
const Stream = require("./mock-stream.js");

const equal = assert.strictEqual;

let counter = 0;

exports.bodyString = () =>
	"body string" + (++counter);

exports.bodyStrings = (count) =>
	List.createWith(exports.bodyString, count);

exports.config = () => ({
	target: { routes: ["/"] },
	expiration: {}
});

exports.doNotCall = (name) =>
	Func.throws(name + " should not be called");

/* cache mocks */
const cacheGet = (f) =>
	(conf, key) => f();

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

exports.ignoreCacheSet = () =>
	cacheSet(Func.empty);

/* client mocks */
exports.requestHome = () =>
	Stream.createGET("/");

exports.expectResponse = (body, done) =>
	Stream.createAndBufferResponse(function (actual) {
		equal(actual, body);
		done();
	});

exports.expectResponseCode = (code, done) =>
	Stream.createResponseEnd(function (res) {
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

exports.responseObject = Stream.responseObjectDumped;
