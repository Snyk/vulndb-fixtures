var _ = require("lodash");
var config = require("../../config") || {};

module.exports = Chan;

function Chan(attr) {
	_.merge(this, _.extend({
		id: global.id = ++global.id || 1,
		name: "",
		type: "channel",
		network: "",
		count: 0,
		messages: [],
		users: [],
	}, attr));
};

Chan.prototype.addMsg = function(msg) {
				this.messages.push(msg);
};

Chan.prototype.addUser = function(user) {
				this.users.push(user);
};

Chan.prototype.sortUsers = function() {
	this.users = _.sortBy(
		this.users,
		function(u) { return u.name.toLowerCase(); }
	);
	var modes = [
		"~",
		"%",
		"@",
		"+",
	].reverse();
	modes.forEach(function(mode) {
		this.users = _.remove(
			this.users,
			function(u) { return u.mode == mode; }
		).concat(this.users);
	}, this);
};

Chan.prototype.toJSON = function() {
	var clone = _.clone(this);
	clone.count = clone.messages.length;
	clone.messages = clone.messages.slice(-100);
	return clone;
};
