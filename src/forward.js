const cond = require("utils/cond.js");
const Func = require("utils/func.js");
const Prms = require("utils/promise.js");
const Client = require("./client.js");
const Hdrs = require("./headers.js");

const ifOk = cond(Hdrs.isOk);
const if3XX = cond(Hdrs.isClass(3));

const rejectIfNotOk =
	ifOk(Func.id, Prms.reject);

const rejectIf3XX =
	if3XX(Prms.reject, Func.id);

const writeHead = (code, hdrs) => (res) =>
	(res.writeHead(code, hdrs), res);

const writeHeadOf = (src) =>
	writeHead(src.statusCode, src.headers);

exports.request = (req) =>
	Client.forward(req);

exports.requestOk = (req) =>
	Client.get(req).then(rejectIf3XX).then(rejectIfNotOk);

exports.requestUntilOk = (req) =>
	new Promise(function self(done, fail) {
		const retry = () => self(done, fail);
		Client.get(req)
			.then(rejectIf3XX)
			.then(ifOk(done, retry))
			.catch(fail);
	});

exports.response = (dest) => (res) =>
	res.pipe(writeHeadOf(res)(dest));

exports.error = (dest) => (obj) =>
	obj.statusCode
		? exports.response(dest)(obj)
		: writeHead(500, Hdrs.textPlain)(dest).end(obj.toString());
