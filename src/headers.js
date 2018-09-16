const Func = require("utils/func.js");
const If = require("utils/if.js");
const Obj = require("utils/obj.js");
const target = require("../config.json").target;

const classOf = (code) =>
	Math.floor(code / 100);

const isClass = (num) => (code) =>
	classOf(code) === num;

exports.isClass = (num) => (res) =>
	isClass(num)(res.statusCode);

exports.isFatal = (res) =>
	If.def(isClass(3), Func.ret(true))(res.statusCode);

exports.isOk = (res) =>
	classOf(res.statusCode) < 3;

exports.stripReq = Obj.set("headers", {host: target.host});
exports.stripRes = Obj.map("headers", Obj.forwardTo({}, "content-type"));
exports.textPlain = {"content-type": "text/plain"};
