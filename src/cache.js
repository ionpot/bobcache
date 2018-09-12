const Err = require("utils/error.js");
const Obj = require("utils/obj.js");
const Stream = require("utils/stream.js");
const Cache = require("./cache-map.js");

const NO_ENTRY = Symbol("error code for when fetch doesn't find an entry");

const keyOf = (req) => req.url;

const forward =
	Obj.forward(["headers", "statusCode"]);

const toEntry = (res) =>
	forward(res, {});

const toResponse = (val) =>
	forward(val, Stream.readableWith(val.body));

const noEntry = () =>
	Err.make(NO_ENTRY);

exports.get = (req) =>
	Cache.fetch(keyOf(req))
		.then(toResponse)
		.catch(noEntry);

exports.isNoEntry = Err.is(NO_ENTRY);

exports.set = (req) => (res) =>
	Cache.store(keyOf(req), toEntry(res));
