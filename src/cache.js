const cond = require("utils/cond.js");
const Err = require("utils/error.js");
const Func = require("utils/func.js");
const Obj = require("utils/obj.js");
const Stream = require("utils/stream.js");
const Cache = require("./cache-map.js");

const CACHED = Symbol("prevents storing the same thing");
const NO_ENTRY = Symbol("error code for when fetch doesn't find an entry");

const isCached = Obj.get(CACHED);
const setAsCached = Obj.set(CACHED, true);

const keyOf = (req) => req.url;

const forward =
	Obj.forward([CACHED, "headers", "statusCode"]);

const toEntry = (res) =>
	forward(setAsCached(res), {});

const toResponse = (val) =>
	forward(val, Stream.readableWith(val.body));

const noEntry = () =>
	Err.make(NO_ENTRY);

exports.get = (req) =>
	Cache.fetch(keyOf(req))
		.then(toResponse)
		.catch(noEntry);

exports.isNoEntry = (err) =>
	err.code === NO_ENTRY;

exports.set = (req) => (res) =>
	Cache.store(keyOf(req), toEntry(res));

exports.trySet = (req) =>
	cond(isCached)(Func.empty, exports.set(req));
