const Err = require("utils/error.js");
const Obj = require("utils/obj.js");
const Stream = require("utils/stream.js");
const Time = require("utils/time.js");
const Config = require("../config.json");
const Cache = require("./cache-map.js");

const duration = Time.toMilliseconds(Config.expiration || {});
const NO_ENTRY = Symbol("error code for when fetch doesn't find an entry");

const keyOf = (req) => req.url;

const forward =
	Obj.forward(["headers", "statusCode"]);

const toEntry = (res) => (body) =>
	forward(res, {body});

const toResponse = (val) =>
	forward(val, Stream.readableWith(val.body));

const noEntry = () =>
	Promise.reject(Err.make(NO_ENTRY));

exports.get = (req) =>
	Cache.fetch(keyOf(req))
		.then(toResponse)
		.catch(noEntry);

exports.isNoEntry = Err.is(NO_ENTRY);

exports.set = (req) => (res) =>
	Stream.read(res)
		.then(toEntry(res))
		.then(Cache.store(keyOf(req), duration));

exports.clear = Cache.clear;
