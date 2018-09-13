const P = require("utils/promise.js");

const map = new Map();
const fetch = (key) => map.get(key);
const has = (key) => map.has(key);
const store = (key, val) => void map.set(key, val);

exports.fetch = (key) =>
	P.cond(has)(key).then(fetch);

exports.store = (key) => (val) =>
	store(key, val);
