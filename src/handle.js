const cond = require("utils/cond.js");
const RegEx = require("utils/regexp.js");
const Str = require("utils/str.js");
const Fw = require("./forward.js");
const useCache = require("./use-cache.js");

const matches = (routes, url) =>
	routes
		.map(str => RegEx.makeFull(str))
		.some(RegEx.test(Str.noTrailingSlashes(url)));

const canCache = (routes) => (req) =>
	req.method === "GET"
	&& matches(routes, req.url);

const request = (routes) =>
	cond(canCache(routes))(useCache, Fw.request);

module.exports = (routes) => (req, res) =>
	request(routes)(req)
		.then(Fw.response(res))
		.catch(Fw.error(res));
