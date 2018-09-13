const RegEx = require("utils/regexp.js");
const Str = require("utils/str.js");
const Fw = require("./forward.js");
const useCache = require("./use-cache.js");
const noCache = require("./no-cache.js");

const matches = (routes, url) =>
	routes
		.map(str => RegEx.makeFull(str))
		.some(RegEx.test(Str.noTrailingSlashes(url)));

const canCache = (routes, req) =>
	req.method === "GET"
	&& matches(routes, req.url);

const handlerOf = (routes, req) =>
	canCache(routes, req)
		? useCache
		: noCache;

module.exports = (routes) => (req, res) =>
	handlerOf(routes, req)(req, res)
		.catch(Fw.error(res));
