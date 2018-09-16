const Obj = require("utils/obj.js");
const target = require("../config.json").target;

exports.stripReq = Obj.set("headers", {host: target.host});
exports.stripRes = Obj.map("headers", Obj.forwardTo({}, "content-type"));
