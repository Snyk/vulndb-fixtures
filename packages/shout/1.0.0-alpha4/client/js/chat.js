$(function() {
	var chat = $("#chat");
	var sidebar = $("#sidebar");
	
	var commands = [
		"/ame",
		"/amsg",
		"/close",
		"/connect",
		"/deop",
		"/devoice",
		"/disconnect",
		"/invite",
		"/join",
		"/kick",
		"/leave",
		"/mode",
		"/msg",
		"/nick",
		"/notice",
		"/op",
		"/part",
		"/partall",
		"/query",
		"/quit",
		"/raw",
		"/say",
		"/send",
		"/server",
		"/slap",
		"/topic",
		"/voice",
		"/whois",
	];
	
	var socket = io.connect("");
	var events = [
		"join",
		"messages",
		"msg",
		"networks",
		"nick",
		"part",
		"users",
	].forEach(function(e) {
		socket.on(e, function(data) {
			event(e, data);
		});
	});
	
	var tpl = [];
	function render(name, data) {
		tpl[name] = tpl[name] || Handlebars.compile($("#templates ." + name).html());
		return tpl[name](data);
	}
	
	function event(e, data) {
		switch (e) {
		case "join":
			chat.append(render("windows", {windows: [data.chan]}))
				.find(".window")
				.last()
				.find(".chat")
				.sticky()
				.end()
				.find(".input")
				.tabcomplete(commands, {hint: false});
			
			$("#network-" + data.id)
				.append(render("channels", {channels: [data.chan]}))
				.find("a")
				.last()
				.trigger("click");
			break;
		
		case "messages":
		case "msg":
			var target = $("#window-" + data.id).find(".messages");
			var html = render(
				"messages",
				{messages: toArray(data.msg)}
			);
			switch (e) {
			case "messages":
				target.prepend(html);
				break;
			
			case "msg":
				target.append(html);
				break;
			}
			break;
		
		case "networks":
			var channels = $.map(data.networks, function(n) { return n.channels; });
			chat.html(render("windows", {windows: channels}))
				.find(".input")
				.tabcomplete(commands, {hint: false})
				.end()
				.find(".hidden")
				.prev(".show-more")
				.show();
			chat.find(".chat")
				.sticky()
				.end();
			
			var networks = $("#networks")
				.html(render("networks", {networks: data.networks}))
				.find("a")
				.last()
				.trigger("click");
			break;
		
		case "part":
			$("#channel-" + data.id)
				.add("#window-" + data.id)
				.remove();
			break;
		
		case "users":
			var target = $("#window-" + data.id);
			var json = {
				name: target.find("h1").html(),
				users: data.users
			};
			target.find(".meta")
				.replaceWith(render("meta", json))
				.end();
			target.find(".users")
				.html(render("users", json))
				.end();
			break;
		}
	}
	
	var viewport = $("#viewport");
	var touchDevice = (window.screen.width <= 768);
	
	var z = 1;
	sidebar.on("click", "a", function(e) {
		e.preventDefault();
		var link = $(this);
		var target = link.attr("href");
		if (!target) {
			return;
		}
		viewport.removeClass();
		sidebar.find(".active").removeClass("active");
		link.addClass("active")
			.find(".badge")
			.removeClass("highlight")
			.empty();
		var window = $(target)
			.siblings()
			.removeClass("active")
			.end()
			.css("z-index", z++)
			.addClass("active");
		
		if (!touchDevice) {
			window.find("input").focus();
		}
	});
	
	sidebar.on("click", ".close", function() {
		var channel = $(this).closest("a");
		var id = parseInt(channel.attr("id").split("-")[1]);
		var cmd = "/close";
		if (channel.hasClass("lobby")) {
			cmd = "/quit";
			var server = channel
				.clone()
				.remove("span")
				.text()
				.trim();
			if (!confirm("Disconnect from " + server + "?")) {
				return false;
			}
		}
		socket.emit("input", {
			id: id,
			text: cmd,
		});
		channel.css({
			transition: "none",
			opacity: .4
		});
		return false;
	});
	
	chat.on("append", ".messages", function() {
		var messages = $(this);
		var id = messages.closest(".window").find(".form").data("target");
		var badge = $("#channel-" + id + ":not(.active) .badge");
		if (badge.length != 0) {
			var i = (parseInt(badge.html()) || 0) + 1;
			badge.html(i);
			if (messages.children().last().hasClass("highlight")) {
				badge.addClass("highlight");
			}
		}
	});
	
	chat.on("click", ".show-more", function() {
		var btn = $(this);
		var messages = btn.closest(".chat").find(".messages").children();
		socket.emit("fetch", {
			id: btn.data("id"),
			count: messages.length,
		});
		btn.attr("disabled", true);
	});
	
	chat.on("click", ".user", function(e) {
		e.preventDefault();
		var user = $(this);
		var id = user
			.closest(".window")
			.data("id");
		
		// Remove modes
		var name = user.html().replace(/[\s+@]/g, "");
		if (name.match(/[#.]|-!-/) != null) {
			return;
		}
		
		socket.emit("input", {
			id: id,
			text: "/whois " + name,
		});
	});
	
	chat.on("focus", ".input", function() {
		$(this).closest(".window").find(".chat").scrollToBottom();
	});
	
	chat.on("submit", "form", function(e) {
		e.preventDefault();
		var form = $(this);
		var input = form.find(".input:not(.hint)");
		var text = input.val();
		if (text == "") {
			return;
		}
		input.val("");
		input.prev(".hint").val("");
		socket.emit("input", {
			id: form.data("target"),
			text: text,
		});
	});
	
	var toggle = "click";
	if (touchDevice) {
		toggle = "touchstart";
	}
	chat.on(toggle, ".lt, .rt", function() {
		var btn = $(this);
		viewport.toggleClass(btn.attr("class"));
	});
	
	function toArray(val) {
		return Array.isArray(val) ? val : [val];
	}

	function escape(text) {
		var e = {
			"<": "&lt;",
			">": "&gt;"
		};
		return text.replace(/[<>]/g, function (c) {
			return e[c];
		});
	}
	
	Handlebars.registerHelper(
		"uri", function(text) {
			text = escape(text);
			return URI.withinString(text, function(url) {
				return "<a href='" + url.replace(/^www/, "//www") + "' target='_blank'>" + url + "</a>";
			});
		}
	);
	
	Handlebars.registerHelper(
		"partial", function(id) {
			return new Handlebars.SafeString(render(id, this));
		}
	);
});
