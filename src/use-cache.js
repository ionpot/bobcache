const Func = require("utils/func.js");
const Cache = require("./cache.js");
const Fw = require("./forward.js");
const race = require("./race.js");

const tryToRace = (req, cache) => (err) =>
	err.statusCode
		? race(req, cache)
		: Promise.reject(err);

module.exports = function (req, res) {
	const cache = Cache.get(req).catch(Func.empty);
	return Fw.requestOk(req)
		.then(Func.side(Cache.set(req)))
		.catch(tryToRace(req, cache))
		.then(Fw.response(res));
};
