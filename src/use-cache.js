const Func = require("utils/func.js");
const Cache = require("./cache.js");
const Fw = require("./forward.js");
const race = require("./race.js");

const cacheFetch = (req) =>
	Cache.get(req).catch(Func.id);

const tryToRace = (req, cache) => (err) =>
	err.statusCode
		? race(req, cache)
		: Promise.reject(err);

// cacheFetch doesn't have to wait for Fw.requestOk to fail
// they run in parallel to save time
// if requestOk fails, then it's a race between the next request and cacheFetch
module.exports = (req, res) =>
	Fw.requestOk(req)
		.then(Func.side(Cache.set(req)))
		.catch(tryToRace(req, cacheFetch(req)))
		.then(Fw.response(res));
