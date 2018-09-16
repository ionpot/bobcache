const Func = require("utils/func.js");
const If = require("utils/if.js");
const P = require("utils/promise.js");
const Timer = require("utils/timer.js");

const map = new Map();
const fetch = (key) => map.get(key);
const has = (key) => map.has(key);
const store = (key, val) => map.set(key, val);
const remove = (key) => map.delete(key);
const clear = () => map.clear();

const timers = new Map();
const onExpire = (key) => function () {
	remove(key);
	timers.delete(key);
};

const addTimer = (key, duration) => () =>
	timers.set(key, Timer.make(onExpire(key), duration));

const rmvTimer = (key) => () =>
	timers.delete(key);

const schedule = (key) => (duration) =>
	Func.map(timers.get(key))
		(If.def(Timer.reset, addTimer(key, duration)));

exports.fetch = (key) =>
	P.cond(has)(key).then(fetch);

exports.store = (key, duration) => function (val) {
	If.positive(schedule(key), rmvTimer(key))(duration);
	store(key, val);
};

exports.clear = clear;
