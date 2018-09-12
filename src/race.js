const cond = require("utils/cond.js");
const Func = require("utils/func.js");
const Cache = require("./cache.js");
const Fw = require("./forward.js");

const ifNoEntry = cond(Cache.isNoEntry);

const waitCache = (cache) => (err) =>
	cache.catch(() => Promise.reject(err));

module.exports = function (req, cache) {
	// only rejects in the case of a fatal network error
	const fw = Fw.requestUntilOk(req)

		// got response, issue a cache set
		.then(Func.side(Cache.set(req)));

	// cache is most likely already resolved/rejected at this point
	return Promise.race([fw, cache])

		// if cache fails, wait for fw
		// if fw fails, wait for cache
		// if cache also fails, return fw's error
		.catch(ifNoEntry(Func.ret(fw), waitCache(cache)));
};
