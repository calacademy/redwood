var RedwoodSequence = function () {
	var _selectEvent = Modernizr.touch ? 'touchend' : 'click';
	var _container;
	var _buttons;
	var _timer;

	var _clear = function () {
		if (_buttons) {
			_buttons.removeClass('highlight');
		}

		if (_container) {
			_container.find('.legend, img').removeClass('open');
		}
	}

	var _display = function (el) {
		_clear();
		el.addClass('open');
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
	}

	this.setContainer = function (container) {
		_container = container;
		_buttons = _container.closest('section').find('.buttons > li');
		
		this.destroy();

		_buttons.on(_selectEvent, _onButton);
	}

	this.initialize = function () {
	}

	this.initialize();
}
