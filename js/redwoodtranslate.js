var RedwoodTranslate = function (data) {
	var _languages = ['en', 'cn', 'tl', 'es'];
	var _event = Modernizr.touch ? 'touchend' : 'mousedown';
	var _inst = this;
	var _timeout;

	var _stopPropagation = function (e) {
		if (_timeout) {
			clearTimeout(_timeout);
		}

		_timeout = setTimeout(_onTimeout, REDWOOD_CONFIG.idleSeconds * 1000);
		e.preventDefault();
		e.stopPropagation();
	}

	var _onTimeout = function () {
		if ($('html').hasClass('attract')) {
			_inst.reset();
		}
	}

	var _setLanguage = function (lg) {
		$('#languages li').removeClass('active');
		$('#' + lg).addClass('active');

		$('html').attr('lang', lg);
		$(document).trigger('languagechange');
	}

	var _onLgSelect = function (e) {
		if ($('html').hasClass('attract')) {
			_stopPropagation(e);
		} else {
			$(document).idleTimer('reset');
		}

		if (e.type == _event) {
			_setLanguage($(this).attr('id'));
		}

		return false;
	}

	var _initInteraction = function () {
		$('#languages li').on('mousedown touchstart touchend', _onLgSelect);
	}

	var _populateSections = function () {
		$.each(data.sections, function (i, obj) {
			var aside = $('aside[machine_id="' + obj.title.slug() + '"]');

			// buttons
			$.each(obj.buttons, function (j, btn) {
				var container = aside.find('.buttons li[machine_id="' + btn.machine_id.safe_value + '"]');
				var copy = container.find('.copy');

				if (copy.length == 1) {
					container = copy;
				}

				var unsafe = btn.machine_id.safe_value == 'meanwhile';
				_populateField(container, btn, '', unsafe);
			});

			// body
			var copy = $('<div />');
			copy.addClass('copy');
			aside.prepend(copy);
			_populateField(copy, obj.details[0], 'desc_');

			// title
			var h1 = $('<h1 />');
			aside.prepend(h1);
			_populateField(h1, obj.details[0], 'header_');
		});
	}

	var _populateHotspots = function () {
		$.each(data.hotspots[0].hotspots, function (i, obj) {
			var point = $('#points div[data-target="' + obj.machine_id.value + '"]');
			_populateField(point, obj);
		});
	}

	var _populatePopups = function () {
		$.each(data.popups[0].popups, function (i, obj) {
			var slug = obj.header_en.safe_value.slug();
			
			var legend = $('.legend[machine_id="' + slug + '"]');
			var isTimeline = legend.parents('#meanwhile').length == 1;

			// thumbnail
			if (obj.thumbnail) {
				var img = $('<img />');
				img.attr('src', _getSrc(obj.thumbnail));
				legend.append(img);
			} else {
				if (isTimeline) {
					// fpo
					legend.append($('<img />', {
						src: 'https://via.placeholder.com/444x444'
					}));
				}
			}

			// title
			var h2 = $('<h2 />');
			legend.append(h2);
			_populateField(h2, obj, 'header_');
			
			// body
			var copy = $('<div />');
			copy.addClass('copy');
			legend.append(copy);
			_populateField(copy, obj);
		});
	}

	var _populateCredits = function () {
		$('#credits').addClass('open');
		var maxHeight = 860;

		var ul = $('<ul />');
		$('#credits .credits-container').append(ul);

		$.each(data.credits[0].credits, function (i, obj) {
			var li = $('<li />');
			var h2 = $('<h2 />');
			var div = $('<div />');
			li.append(h2);
			li.append(div);

			if (obj.header_en) {
				h2.html(obj.header_en.safe_value);	
			} else {
				h2.remove();
			}
			
			if (obj.en) {
				div.html(obj.en.safe_value);	
			} else {
				div.remove();
			}

			ul.append(li);

			if (ul.outerHeight() > maxHeight) {
				// new column
				li.remove();

				ul = $('<ul />');
				$('#credits .credits-container').append(ul);
				ul.append(li);
			}
		});

		$('#credits').removeClass('open');
	}

	var _populateField = function (container, obj, field, unsafe) {
		if (!field) field = '';

		$.each(_languages, function (i, lg) {
			var lgField = $('<div />');
			lgField.addClass(lg);

			if (obj[field + lg]) {
				var val = unsafe ? obj[field + lg].value : obj[field + lg].safe_value;

				lgField.html(val);
				container.append(lgField);	
			}
		});

		// remove if empty
		if ($.trim(container.text()) == '') {
			container.remove();
		}
	}

	var _getSrc = function (obj) {
		var file_path = data.popups[0].file_path;
		return obj.uri.replace('public://', file_path);
	}

	this.reset = function () {
		_setLanguage('en');
	}

	this.initialize = function () {
		console.log(data);
		
		_populateSections();
		_populatePopups();
		_populateHotspots();
		_populateCredits();

		// unwrap any links
		$.each(_languages, function (i, lg) {
			$('.' + lg + ' a').contents().unwrap();
		});

		_initInteraction();
	}

	this.initialize();
}
