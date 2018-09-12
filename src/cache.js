const cond = require("utils/cond.js");
const Err = require("utils/error.js");
const Func = require("utils/func.js");
const Obj = require("utils/obj.js");
const Stream = require("utils/stream.js");

const CACHED = Symbol();
const NO_ENTRY = Symbol();

const map = new Map();
const fetch = (key) => map.get(key);
const has = (key) => map.has(key);
const store = (key, val) => void map.set(key, val);

const isCached = Obj.get(CACHED);
const setAsCached = Obj.set(CACHED, true);

const keyOf = (req) => req.url;

const forward =
	Obj.forward([CACHED, "headers", "statusCode"]);

const toEntry = (res) =>
	forward(setAsCached(res), {});

const toResponse = (val) =>
	forward(val, Stream.readableWith(val.body));

const noEntry = (key) =>
	Err.make(NO_ENTRY, `No entry for "${key}"`);

exports.get = (req) =>
	new Promise(cond(has(keyOf(req))))
		.then(fetch)
		.then(toResponse)
		.catch(noEntry);

exports.isError = (err) =>
	err.code === NO_ENTRY;

exports.set = (req) => (res) =>
	store(keyOf(req), toEntry(res));

exports.trySet = (req) =>
	cond(isCached)(Func.empty, exports.set);
