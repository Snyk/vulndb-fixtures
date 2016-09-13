/*!
 * tabComplete
 * https://github.com/erming/tabComplete
 *
 * Copyright (c) 2014 Mattias Erming <mattias@mattiaserming.com>
 * Licensed under the MIT License.
 *
 * Version 0.2.2
 */

if (typeof jQuery === 'undefined') {
	throw new Error('tabComplete requires jQuery')
}

(function($) {
	$.fn.tabComplete = function(options) {
		var settings = $.extend({
			after: '',
			caseSensitive: false,
			list: [],
		}, options);
		
		var self = this;
		if (self.size() > 1) {
			return self.each(function() {
				$(this).tabComplete(options);
			});
		}
		
		// Keep the list stored in the DOM via jQuery.data()
		self.data('list', settings.list);
		
		var match = [];
		self.on('keydown', function(e) {
			var key = e.which;
			if (key != 9) {
				match = [];
				return;
			}
			
			var text = self.val().trim().split(' ');
			var last = text.splice(-1)[0];
			
			if (!match.length) {
				match = $.grep(self.data('list'), function(w) {
					var l = last;
					if (l == '') {
						return;
					}
					if (!settings.caseSensitive) {
						l = l.toLowerCase();
						w = w.toLowerCase();
					}
					return w.indexOf(l) == 0;
				});
			}
			
			var i = match.indexOf(last) + 1;
			if (i == match.length) {
				i = 0;
			}
			
			if (match.length) {
				text.push(match[i]);
				self.val(text.join(' ') + settings.after);
			}
			
			return false;
		});
		
		return this;
	};
})(jQuery);
