const Obj = require("utils/obj.js");

const Cache = require("../src/cache-map.js");
const Client = require("../src/client.js");
const handle_ = require("../src/handle.js");

const Mock = require("./mock");
const MockCache = require("./mock/cache.js");
const MockClient = require("./mock/client.js");

const routes = ["/"];
const handle = handle_(routes);

const restore = Obj.saveList([Cache, Client]);

suite("handle");

afterEach(restore);

test("return the successful response", function (done) {
	const req = MockClient.requestHome();
	const body = Mock.bodyString();
	const res = MockClient.expectResponse(body, done);
	Cache.fetch = MockCache.noEntry();
	Cache.store = MockCache.ignoreStore();
	Client.get = MockClient.respondBody(body);
	handle(req, res);
});

test("cache a successful response", function (done) {
	const req = MockClient.requestHome();
	const body = Mock.bodyString();
	const res = MockClient.responseObject();
	Cache.fetch = MockCache.noEntry();
	Cache.store = MockCache.expectEntry(body, done);
	Client.get = MockClient.respondBody(body);
	handle(req, res);
});

test("return from cache when request fails", function (done) {
	const req = MockClient.requestHome();
	const body = Mock.bodyString();
	const res = MockClient.expectResponse(body, done);
	Cache.fetch = MockCache.returnEntry(body);
	Cache.store = MockCache.ignoreStore();
	Client.get = MockClient.respondCode(404);
	handle(req, res);
});

test("update the cache with the newer response", function (done) {
	const bodies = Mock.bodyStrings(2);
	Cache.fetch = MockCache.noEntry();
	Cache.store = MockCache.expectEntries(bodies, done);
	Client.get = MockClient.respondBodies(bodies.slice());
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
	Cache.fetch = MockCache.stall();
	Cache.store = MockCache.ignoreStore();
	Client.get = MockClient.respondList([[404, ""], [200, body]]);
	handle(req, res);
});

test("do not cache an unknown route", function (done) {
	const req = MockClient.requestHome();
	const res = MockClient.expectResponseCode(404, done);
	Cache.fetch = Mock.doNotCall("Cache.fetch");
	Cache.store = Mock.doNotCall("Cache.store");
	Client.get = Mock.doNotCall("Client.get");
	Client.forward = MockClient.respondCode(404);
	handle_([])(req, res);
});

test("fail on a class 3 response", function (done) {
	const code = 300;
	const req = MockClient.requestHome();
	const res = MockClient.expectResponseCode(code, done);
	Cache.fetch = MockCache.noEntry();
	Cache.store = Mock.doNotCall("Cache.store");
	Client.get = MockClient.respondCode(code);
	handle(req, res);
});
