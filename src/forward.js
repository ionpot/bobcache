const cond = require("utils/cond.js");
const Func = require("utils/func.js");
const Client = require("./client.js");

const is2XX = (res) =>
	Math.floor(res.statusCode / 100) === 2;

const ifOk = (yes, no) =>
	cond(is2XX, yes, no);

const rejectIfNotOk =
	ifOk(Func.id, (res) => Promise.reject(res));

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
	res.pipe(dest.writeHead(res.statusCode, res.headers));
