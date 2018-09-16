const assert = require("assert");
const Prms = require("utils/promise.js");
const Config = require("../config.json");

const MS = 20;
Config.expiration = {milliseconds: MS};

const Cache = require("../src/cache.js");

const MockCache = require("./mock/cache.js");

const expect = (req, res) => (actual) =>
	MockCache.assertEntry(actual, res, req);

const assertNoEntry = (x) =>
	assert(Cache.isNoEntry(x));

const assertGet = (req, res) => () =>
	Cache.get(req).then(expect(req, res));

const delayGet = (req) => () =>
	Prms.delay(Cache.get, MS * 2, req);

const assertFalse = (msg) => () =>
	assert(false, msg);

const assertSetGet = (req, res) =>
	Cache.set(req)(res)
		.then(assertGet(req, res));

const assertExpiration = (req, res) =>
	assertSetGet(req, res)
		.then(delayGet(req))
		.then(assertFalse("entry did not expire"))
		.catch(assertNoEntry);

const withReq = (req, f) =>
	f(req, MockCache.response(req));

const delayWithReq = (req, f, ms) =>
	Prms.delay(withReq, ms, req, f);

suite("cache");

afterEach(Cache.clear);

test("reject with no entry", function () {
	const req = MockCache.request();
	return Cache.get(req).catch(assertNoEntry);
});

test("store and fetch an entry", function () {
	return withReq(MockCache.request(), assertSetGet);
});

test("entry expires", function () {
	return withReq(MockCache.request(), assertExpiration);
});

test("multiple entries", function () {
	const keys = ["/a", "/b"];
	const list = keys
		.map(MockCache.request)
		.map((req, i) => delayWithReq(req, assertExpiration, i * 10));
	return Promise.all(list);
});
