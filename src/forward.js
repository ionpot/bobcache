const cond = require("utils/cond.js");
const Func = require("utils/func.js");
const Prms = require("utils/promise.js");
const Client = require("./client.js");

const is2XX = (res) =>
	Math.floor(res.statusCode / 100) === 2;

const ifOk = cond(is2XX);

const rejectIfNotOk =
	ifOk(Func.id, Prms.reject);

const writeHead = (code, hdrs) => (res) =>
	res.writeHead(code, hdrs), res;

const writeHeadOf = (src) =>
	writeHead(src.statusCode, src.headers);

exports.request = (req) =>
	Client.forward(req);

exports.requestOk = (req) =>
	Client.get(req).then(rejectIfNotOk);

exports.requestUntilOk = (req) =>
	new Promise(function self(done, fail) {
		const retry = () => self(done, fail);
		Client.get(req)
			.then(ifOk(done, retry))
			.catch(fail);
	});

exports.response = (dest) => (res) =>
	res.pipe(writeHeadOf(res)(dest));

exports.error = (dest) => (obj) =>
	obj.statusCode
		? exports.response(dest)(obj)
		: writeHead(500)(dest).end(obj.toString());
