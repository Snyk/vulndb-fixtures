var config = require("../config");
var fs = require("fs");
var mkdirp = require("mkdirp");
var moment = require("moment");
var Helper = require("./helper");

module.exports = {
	write: function(user, network, chan, msg) {
		var path = Helper.resolveHomePath("users", user, "logs", network);
		try {
			mkdirp.sync(path);
		} catch(e) {
			return;
		}

		var format = (config.logs || {}).format || "YYYY-MM-DD HH:mm:ss";
		var tz = (config.logs || {}).timezone || "UTC+00:00";

		var time = moment().zone(tz).format(format);
		var line = "[" + time + "] ";

		if (msg.type == "message") {
			// Format:
			// [2014-01-01 00:00:00] <Arnold> Put that cookie down.. Now!!
			line += "<" + msg.from + "> " + msg.text;
		} else {
			// Format:
			// [2014-01-01 00:00:00] * Arnold quit
			line += "* " + msg.from + " " + msg.type;
			if (msg.text) {
				line += " " + msg.text;
			}
		}

		try {
			fs.appendFile(
				path + "/" + chan + ".log",
				line + "\n"
			);
		} catch(e) {
			return;
		}
	}
};
