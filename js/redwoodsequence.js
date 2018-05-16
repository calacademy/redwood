var RedwoodSequence = function () {
	var _selectEvent = Modernizr.touch ? 'touchend' : 'click';
	var _container;
	var _buttons;
	var _timer;
	var _activeElements;

	var _clear = function () {
		if (_container) {
			_container.find('.legend, .pic').removeClass('open');
			_container.find('.legend, .arrow').css('animation-delay', '0s');
		}
	}

	var _display = function (el) {
		if (typeof(el) == 'undefined') {
			el = _container.find('.default');
		}

		_clear();

		var hasImage = (el.filter('.pic').length > 0);

		// if this set contains the same image as the last,
		// zero-out the first legend's animation delay
		if (_activeElements) {
			var lastPic = _activeElements.filter('.pic');
			var currentPic = el.filter('.pic');

			if (lastPic.length == 1 && currentPic.length == 1) {
				if (lastPic.attr('id') == currentPic.attr('id')) {
					hasImage = false;
				}
			}
		}

		// add animation delay to legends
		var i = hasImage ? 1 : 0;

		el.filter('.legend').each(function () {
			var delay = i * .2;

			$(this).css('animation-delay', delay + 's');
			$(this).find('.arrow').css('animation-delay', delay + 's');

			i++;
		});

		el.addClass('open');
		_activeElements = el;
	}

	var _incrementStep = function () {
		if (_container.find('.open').length == 0) {
			// default
			_display();
		} else {
			var nextButton = _buttons.eq(0);

			if (_buttons.filter('.highlight').length > 0) {
				// next
				nextButton = _buttons.filter('.highlight').next();

				// back to default
				if (nextButton.length != 1) {
					_display();
					return;
				}
			}

			nextButton.trigger(_selectEvent);
		}
	}

	var _onButton = function (e) {
		// clear timer
		if (_timer) {
			clearTimeout(_timer);
		}

		_buttons.not(this).removeClass('highlight');
		$(this).toggleClass('highlight');

		if ($(this).hasClass('highlight')) {
			// display associated elements
			var target = $(this).data('target');

			if ($.isArray(target)) {
				var arr = [];

				$.each(target, function (i, val) {
					arr.push('#' + val);	
				});

				_display($(arr.join(', ')));
			} else {
				_display($('#' + target));
			}
		} else {
			// back to default
			_display();
		}

		return false;
	}

	this.stop = function () {	
	}

	this.start = function () {
		_incrementStep();
		_timer = setTimeout(_incrementStep, REDWOOD_CONFIG.stepSeconds * 1000);
	}

	this.destroy = function () {
		_clear();

		if (_buttons) {
			_buttons.removeClass('highlight');
			_buttons.off();	
		}

		if (_timer) {
			clearTimeout(_timer);
		}

		_activeElements = null;
	}

	this.setContainer = function (container) {
		_container = container;
		_container.children().not('.legend').addClass('pic');

		_buttons = _container.closest('section').find('.buttons > li');
		
		this.destroy();

		_buttons.on(_selectEvent, _onButton);
	}

	this.initialize = function () {
	}

	this.initialize();
}
