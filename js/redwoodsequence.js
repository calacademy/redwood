var RedwoodSequence = function () {
	var _selectEvent = Modernizr.touch ? 'touchend' : 'click';
	var _container;
	var _buttons;
	var _timer;
	var _activeElements;

	var _clear = function () {
		if (_buttons) {
			_buttons.removeClass('highlight');
		}

		if (_container) {
			_container.find('.legend, img').removeClass('open');
			_container.find('.legend').css('animation-delay', '0s');
		}
	}

	var _display = function (el) {
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

			i++;
		});

		el.addClass('open');
		_activeElements = el;
	}

	var _incrementStep = function () {
		var defaultElements = _container.find('.default');
		
		if (_container.find('.open').length == 0) {
			// default
			_display(defaultElements);
		} else {
			var nextButton = _buttons.eq(0);

			if (_buttons.filter('.highlight').length > 0) {
				// next
				nextButton = _buttons.filter('.highlight').next();

				// back to default
				if (nextButton.length != 1) {
					_display(defaultElements);
					return;
				}
			}

			nextButton.trigger(_selectEvent);
		}
	}

	var _onButton = function (e) {
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

		// highlight button
		$(this).addClass('highlight');

		// reset timer
		if (_timer) {
			clearInterval(_timer);
		}

		_timer = setInterval(_incrementStep, REDWOOD_CONFIG.stepSeconds * 1000);

		return false;
	}

	this.stop = function () {	
	}

	this.start = function () {
		_incrementStep();
		_timer = setInterval(_incrementStep, REDWOOD_CONFIG.stepSeconds * 1000);
	}

	this.destroy = function () {
		_clear();

		if (_buttons) {
			_buttons.off();	
		}

		if (_timer) {
			clearInterval(_timer);
		}

		_activeElements = null;
	}

	this.setContainer = function (container) {
		_container = container;
		_container.children('img').addClass('pic');

		_buttons = _container.closest('section').find('.buttons > li');
		
		this.destroy();

		_buttons.on(_selectEvent, _onButton);
	}

	this.initialize = function () {
	}

	this.initialize();
}
