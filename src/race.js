const cond = require("utils/cond.js");
const Func = require("utils/func.js");
const Prms = require("utils/promise.js");
const Cache = require("./cache.js");
const Fw = require("./forward.js");

const ifNoEntry = (f) =>
	cond(Cache.isNoEntry)(f, Func.id);

const ifNoEntryThen = (x) =>
	ifNoEntry(Func.ret(x));

const waitCache = (cache) => (err) =>
	cache.then(ifNoEntry(Prms.deferReject(err)));

module.exports = function (req, cache) {
	// only rejects in the case of a fatal network error
	const fw = Fw.requestUntilOk(req)

		// got response, cache it
		.then(Func.side(Cache.set(req)));

	// cache is most likely already resolved at this point
	return Promise.race([fw, cache])

		// if cache failed, wait for fw
		.then(ifNoEntryThen(fw))

		// fw failed, wait for cache
		// if cache also fails, return fw's error
		.catch(waitCache(cache));
};
