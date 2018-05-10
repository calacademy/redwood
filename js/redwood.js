// @see
// https://github.com/stevenwanderski/bxslider-4

var Redwood = function () {
	var _selectEvent = Modernizr.touch ? 'touchend' : 'click';
	var _overEvent = Modernizr.touch ? 'touchstart' : 'mouseover';
	var _outEvent = Modernizr.touch ? 'touchend' : 'mouseout click';
	var _media = new RedwoodMedia();
	var _sequence = new RedwoodSequence();
	var _animations = {};
	
	var _lastSection;
	var _translate;
	var _data;

	var _configPositions = function (els) {
		els.show();
		els.draggable();
		
		$(document).on('keyup', function (e) {
			if (e.keyCode != 32) return false;

			var obj = {};

			els.each(function () {
				var id = $(this).data('target');

				if (!id) {
					id = $(this).attr('id');
				}

				obj[id] = {
					'left': $(this).css('left'),
					'top': $(this).css('top')
				};
			});

			console.log(JSON.stringify(obj));

			return false;
		});
	}

	var _onOver = function () {
		$(this).addClass('highlight');
	}
	var _onOut = function () {
		$(this).removeClass('highlight');
	}

	var _onPoint = function () {
		$('#points > div').removeClass('highlight');
		$('#points > div').removeClass('selected');
		$(this).addClass('selected');

		_onNav($(this).data('target'));
	}

	var _onPlay = function () {
		var parent = $(this).parent();
		_onNav('media-overlay', parent.data('src'));

		return false;
	}

	var _initLegends = function () {
		$('.legend').each(function () {
			if ($(this).find('img').length == 0) {
				// no img
				$(this).addClass('no-img');

				// title only
				if ($(this).find('.copy').length == 0) {
					$(this).addClass('title-only');
				}
			} else {
				$(this).addClass('with-img');
			}

			// arrow
			var arrow = $('<div />');
			arrow.addClass('arrow');
			$(this).append(arrow);
		});
	}

	var _initTouchPoints = function () {
		if ($('#points div div').length == 0) {
			// add center mark to points
			$('#points > div').append('<div />');

			// position points
			$('#points > div').each(function () {
				var id = $(this).data('target');

				if (!id) {
					id = $(this).attr('id');
				}

				var pos = REDWOOD_CONFIG.points[id];

				$(this).css({
					'left': pos.left,
					'top': pos.top
				});
			});
		}

		if (window.location.hash == '#drag') {
			_configPositions($('#points > div'));
		} else {
			$('#points > div').off();
			_addHighlightInteraction($('#points > div'));
			$('#points > div').on(_selectEvent, _onPoint);
		}
	}

	var _addHighlightInteraction = function (el) {
		el.on(_overEvent, _onOver);
		el.on(_outEvent, _onOut);
	}

	var _onVideo = function () {
		_onNav('media-overlay', $(this).data('src'));
		return false;
	}

	var _onButtonNav = function () {
		_onNav($(this).data('target'));
		return false;
	}

	var _onNav = function (section, src) {
		// reset and open
		$('html').addClass('show-close');
		$('section').removeClass('open');
		$('html').removeClass('attract');
		$('#btn-credits').removeClass('highlight');

		var newSection = $('#' + section);
		newSection.addClass('open');

		if (newSection.hasClass('full')) {
			$('html').addClass('full-section');
		} else {
			$('html').removeClass('full-section');
		}

		// sequence
		var sequence = newSection.find('.sequence');

		if (sequence.length == 1) {
			_sequence.setContainer(sequence);
			_sequence.start();
		} else {
			_sequence.destroy();
		}

		// last section
		_lastSection = $('html').attr('active-section');
		$('html').attr('active-section', section);

		// section-specific stuff
		switch (section) {
			case 'attract':
				if (_translate) {
					_translate.reset();
				}
				
				$('html').removeClass('show-close');
				$('html').addClass('attract');
				break;
			case 'credits':
				$('#btn-credits').addClass('highlight');
				break;
			case 'media-overlay':
				_media.playVideo(src);
				break;
			case 'main':
				$('html').removeClass('show-close');
				$('#points > div').removeClass('highlight');
				$('#points > div').removeClass('selected');
				_initTouchPoints();
				break;
		}
	}

	var _onClose = function () {
		$('html').removeClass('show-close');
		$('section').removeClass('open');
		_media.destroy();

		// default to home
		var targetSection = 'main';
		
		// if closing an overlay, go to last open section
		var section = $('#' + $('html').attr('active-section'));

		if (section.hasClass('overlay')) {
			if (_lastSection) {
				targetSection = _lastSection;
			}
		}

		_onNav(targetSection);
		
		return false;
	}

	var _onVideoEnded = function () {
		$(document).idleTimer('reset');
		_onClose();
	}

	var _stopPropagation = function (e) {
		$(document).idleTimer('reset');
		e.preventDefault();
		e.stopPropagation();
	}

	var _initTranslate = function () {
		_translate = new RedwoodTranslate(_data);
	}

	var _initIdleTimer = function () {
		$(document).idleTimer({
			timeout: REDWOOD_CONFIG.idleSeconds * 1000,
			events: 'keydown mousedown touchstart'
		});

		$(document).on('idle.idleTimer', function (event, elem, obj) {
			if ($('html').hasClass('video-playing')) {
				$(document).idleTimer('reset');
				return;
			}
			
			console.log('idle');
			_onNav('attract');
    	});

    	$(document).on('active.idleTimer', function (event, elem, obj, triggerevent) {
    		console.log('active');
    		_onNav('main');
    	});
	}

	var _initNav = function () {
		_addHighlightInteraction($('#close, .nav, .video button'));
		$('.with-point').prepend('<div class="point"><div /></div>');

		$('#close').on(_selectEvent, _onClose);
		$('.nav').on(_selectEvent, _onButtonNav);
		$('.video button').on(_selectEvent, _onVideo);
	}

	var _onError = function () {
		$(document).off('imgerror');
		$(window).off('load');
		$(document).off('redwoodmodel');
		
		$('#loading h1').html('This exhibit is being updated.');
	}

	var _onData = function (e, data) {
		_data = data;
		$('html').addClass('data-loaded');

		if ($('html').hasClass('content-loaded')) {
			_start();	
		}
	}

	var _onLoad = function () {
		$('html').addClass('content-loaded');

		if ($('html').hasClass('data-loaded')) {
			_start();	
		}
	}

	var _start = function () {
		if ($('html').hasClass('loaded')) return;
		
		$('html').addClass('loaded');
		$(document).on('videoended', _onVideoEnded);

		_initIdleTimer();
		_initLegends();
		_initTranslate();
		_initNav();

		// start animations
		$.each(_animations, function (key, val) {
			if (val) {
				val.start();	
			}
		});

		// start attracting
		$(document).idleTimer('toggle');
	}

	this.initialize = function () {
		// listen for load events
		$(document).off('redwoodmodel');
		$(document).on('redwoodmodel.error', _onError);
		$(document).on('redwoodmodel.success', _onData);
		
		$(document).on('imgerror', _onError);
		$(window).on('load', _onLoad);

		// chinese glyphs
		$('.cn-sample').first().clone().addClass('medium').appendTo('#preload');
		$('.cn-sample').first().clone().addClass('semibold').appendTo('#preload');

		// data
		var foo = new RedwoodModel();
	}

	this.initialize();
}
