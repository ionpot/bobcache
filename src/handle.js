const Fw = require("./forward.js");
const useCache = require("./use-cache.js");
const noCache = require("./no-cache.js");

const canCache = (routes, req) =>
	req.method === "GET"
	&& routes.includes(req.url);

const handlerOf = (routes, req) =>
	canCache(routes, req)
		? useCache
		: noCache;

module.exports = (routes) => (req, res) =>
	handlerOf(routes, req)(req, res)
		.catch(Fw.error(res));
