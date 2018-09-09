const Func = require("utils/func.js");
const List = require("utils/list.js");

let counter = 0;

exports.bodyString = () =>
	"body string" + (++counter);

exports.bodyStrings = (count) =>
	List.createWith(exports.bodyString, count);

exports.config = () => ({
	target: { routes: ["/"] },
	expiration: {}
});

exports.doNotCall = (name) =>
	Func.throws(name + " should not be called");
