const Fw = require("./forward.js");

module.exports = (req, res) =>
	Fw.request(req).then(Fw.response(res));
