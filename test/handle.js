const Obj = require("utils/obj.js");

const Cache = require("../src/cache.js");
const Client = require("../src/client.js");
const handle_ = require("../src/handle.js");

const Mock = require("./mock.js");

const config = Mock.config();
const handle = handle_(config);

const restore = Obj.saveList([Cache, Client, config.target]);

suite("handle");

afterEach(restore);

test("return the successful response", function (done) {
	const req = Mock.requestHome();
	const body = Mock.bodyString();
	const res = Mock.expectResponse(body, done);
	Client.get = Mock.respondOk(body);
	handle(req, res);
});

test("cache a successful response", function (done) {
	const req = Mock.requestHome();
	const body = Mock.bodyString();
	const res = Mock.responseObject();
	Cache.get = Mock.noEntry();
	Cache.set = Mock.expectEntry(body, done);
	Client.get = Mock.respondOk(body);
	handle(req, res);
});

test("return from cache when request fails", function (done) {
	const req = Mock.requestHome();
	const body = Mock.bodyString();
	const res = Mock.expectResponse(body, done);
	Cache.get = Mock.returnEntry(body);
	Cache.set = Mock.ignoreCacheSet();
	Client.get = Mock.respondError(404);
	handle(req, res);
});

test("update the cache with the newer response", function (done) {
	const bodies = Mock.bodyStrings(2);
	Cache.get = Mock.noEntry();
	Cache.set = Mock.expectEntries(bodies, done);
	Client.get = Mock.respondOkList(bodies);
	bodies.forEach(function () {
		const req = Mock.requestHome();
		const res = Mock.responseObject();
		handle(req, res);
	});
});

test("successful response outruns cache", function (done) {
	const req = Mock.requestHome();
	const body = Mock.bodyString();
	const res = Mock.expectResponse(body, done);
	Cache.get = Mock.noReturnEntry();
	Cache.set = Mock.ignoreCacheSet();
	Client.get = Mock.respondList([[404, ""], [200, body]]);
	handle(req, res);
});

test("do not cache an unknown route", function (done) {
	const req = Mock.requestHome();
	const res = Mock.expectResponseCode(404, done);
	Cache.get = Mock.doNotCall("cache get");
	Cache.set = Mock.doNotCall("cache set");
	Client.get = Mock.respondError(404);
	config.target.routes = [];
	handle(req, res);
});
