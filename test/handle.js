const Obj = require("utils/obj.js");

const Cache = require("../src/cache.js");
const Client = require("../src/client.js");
const handle_ = require("../src/handle.js");

const Mock = require("./mock");
const MockCache = require("./mock/cache.js");
const MockClient = require("./mock/client.js");

const config = Mock.config();
const handle = handle_(config);

const restore = Obj.saveList([Cache, Client, config.target]);

suite("handle");

afterEach(restore);

test("return the successful response", function (done) {
	const req = MockClient.requestHome();
	const body = Mock.bodyString();
	const res = MockClient.expectResponse(body, done);
	Client.get = MockClient.respondBody(body);
	handle(req, res);
});

test("cache a successful response", function (done) {
	const req = MockClient.requestHome();
	const body = Mock.bodyString();
	const res = MockClient.responseObject();
	Cache.get = MockCache.noEntry();
	Cache.set = MockCache.expectEntry(body, done);
	Client.get = MockClient.respondBody(body);
	handle(req, res);
});

test("return from cache when request fails", function (done) {
	const req = MockClient.requestHome();
	const body = Mock.bodyString();
	const res = MockClient.expectResponse(body, done);
	Cache.get = MockCache.returnEntry(body);
	Cache.set = MockCache.ignoreSet();
	Client.get = MockClient.respondCode(404);
	handle(req, res);
});

test("update the cache with the newer response", function (done) {
	const bodies = Mock.bodyStrings(2);
	Cache.get = MockCache.noEntry();
	Cache.set = MockCache.expectEntries(bodies, done);
	Client.get = MockClient.respondBodies(bodies);
	bodies.forEach(function () {
		const req = MockClient.requestHome();
		const res = MockClient.responseObject();
		handle(req, res);
	});
});

test("successful response outruns cache", function (done) {
	const req = MockClient.requestHome();
	const body = Mock.bodyString();
	const res = MockClient.expectResponse(body, done);
	Cache.get = MockCache.noReturnEntry();
	Cache.set = MockCache.ignoreSet();
	Client.get = MockClient.respondList([[404, ""], [200, body]]);
	handle(req, res);
});

test("do not cache an unknown route", function (done) {
	const req = MockClient.requestHome();
	const res = MockClient.expectResponseCode(404, done);
	Cache.get = Mock.doNotCall("cache get");
	Cache.set = Mock.doNotCall("cache set");
	Client.get = MockClient.respondCode(404);
	config.target.routes = [];
	handle(req, res);
});
