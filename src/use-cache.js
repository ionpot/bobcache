const Func = require("utils/func.js");
const Cache = require("./cache.js");
const Fw = require("./forward.js");
const race = require("./race.js");

const tryToCache = (req) => function (res) {
	Cache.trySet(req, res);
	return res;
};

const tryToRace = (req, cache) => (err) =>
	err.statusCode
		? race(req, cache)
		: Promise.reject(err);

module.exports = function (req, res) {
	const cache = Cache.toResponse(req).catch(Func.empty);
	return Fw.requestOk(req)
		.catch(tryToRace(req, cache))
		.then(tryToCache(req))
		.then(Fw.response(res));
};
