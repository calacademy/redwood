// @see
// https://github.com/stevenwanderski/bxslider-4

(function ($) {
	String.prototype.slug = function () {
		var str = $.trim(this).toLowerCase();
		str = str.replace(/[^0-9a-z\s]/gi, '');
		return str.replace(/\s/g, '-');
	}

    $.extend({
        getQueryString: function (name) {
            function parseParams() {
                var params = {},
                    e,
                    a = /\+/g,
                    r = /([^&=]+)=?([^&]*)/g,
                    d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
                    q = window.location.search.substring(1);

                while (e = r.exec(q))
                    params[d(e[1])] = d(e[2]);

                return params;
            }

            if (!this.queryStringParams)
                this.queryStringParams = parseParams();

            return this.queryStringParams[name];
        }
    });
})(jQuery);

var Redwood = function () {
	var _selectEvent = Modernizr.touch ? 'touchend' : 'click';
	var _overEvent = Modernizr.touch ? 'touchstart' : 'mouseover';
	var _outEvent = Modernizr.touch ? 'touchend' : 'mouseout click';
	var _configPoints = (window.location.hash == '#points');
	var _media = new Media();
	var _sequence = new RedwoodSequence();
	var _attract = new RedwoodAttract();
	
	var _lastSection;
	var _translate;
	var _data;
	var _map;

	var _configPositions = function (els) {
		els.show();
		els.draggable();
		
		$(document).on('keyup', function (e) {
			if (e.keyCode != 32) return false;

			var obj = {};

			els.each(function () {
				var id = $(this).attr('id');
				
				if (!id) {
					id = $(this).closest('section').attr('id');
				}

				obj[id] = {
					'left': Math.round(parseFloat($(this).css('left'))) + 'px',
					'top': Math.round(parseFloat($(this).css('top'))) + 'px'
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
		$('.first-view').removeClass('first-view');

		$('.point').removeClass('highlight');
		$('.point').removeClass('selected');
		
		$(this).addClass('selected');
		$(this).addClass('visited');

		var target = null;

		if ($(this).find('label').length == 1) {
			target = $.trim($(this).find('label').data('target'));
		} else {
			target = $(this).data('target');
		}
		
		_onNav(target);
	}

	var _initTouchPoints = function () {
		if (_configPoints) return;

		$('.point').off();
		_addHighlightInteraction($('.point'));
		$('.point').on(_selectEvent, _onPoint);
	}

	var _initMap = function () {
		if (_map) {
			if (!_map.hasPoints()) {
				_map.addPoints($('#points > div'));
			}

			return;			
		}

		_map = new RedwoodMap($('#round'), _configPoints);
		_map.addPoints($('#points > div'));
	}

	var _initMinimap = function () {
		// position indicator
		$('.mini-map').each(function () {
			var id = $(this).closest('section').attr('id');
			var pos = REDWOOD_CONFIG.minimap[id];

			if (pos) {
				var div = $('<div />');
				
				div.css({
					'left': pos.left,
					'top': pos.top
				});

				$(this).append(div);
			}
		});

		if (window.location.hash == '#minimap') {
			_configPositions($('.mini-map > div'));
		} else {
			// tap to close
			_addHighlightInteraction($('.mini-map'));

			$('.mini-map').on(_selectEvent, function () {
				$(this).removeClass('highlight');
				$('#close').trigger(_selectEvent);
			});
		}
	}

	var _initLegends = function () {
		$('.legend').each(function () {
			if ($(this).find('img').length == 0) {
				// no img
				$(this).addClass('no-img');

				// title only
				if ($(this).find('.copy').length == 0) {
					$(this).addClass('title-only');
					$(this).addClass('center');
				}
			} else {
				$(this).addClass('with-img');
			}

			// arrow
			var arrow = $('<div />');
			arrow.addClass('arrow');
			$(this).append(arrow);

			// position
			var id = $(this).attr('id');
			var pos = REDWOOD_CONFIG.legends[id];

			if (pos) {
				$(this).css({
					'left': pos.left,
					'top': pos.top
				});
			}
		});

		if (window.location.hash == '#legends') {
			_configPositions($('.legend'));
		}
	}

	var _addHighlightInteraction = function (el) {
		el.on(_overEvent, _onOver);
		el.on(_outEvent, _onOut);
	}

	var _onVideo = function () {
		_media.setNavSource($(this).closest('section').attr('id'));
		_onNav('media-overlay', $(this).data('src'));
		return false;
	}

	var _onButtonNav = function () {
		_onNav($(this).data('target'));
		return false;
	}

	var _toggleCloseButton = function (section) {
		if ($('#' + section).hasClass('no-close')) {
			$('html').removeClass('show-close');
		} else {
			$('html').addClass('show-close');
		}
	}

	var _initMainNav = function () {
		var btn = $('#main .buttons > li');
		
		btn.removeClass();
		btn.off();

		_addHighlightInteraction(btn);
		btn.on(_selectEvent, _onPoint);
	}

	var _initSequence = function (section) {
		var sequence = $('#' + section).find('.sequence');
		var btns = $('#' + section).find('.buttons > li');
		btns.off();

		if (sequence.length == 1) {
			_sequence.setContainer(sequence);
			_addHighlightInteraction(btns);
			_sequence.start();
		} else {
			_sequence.destroy();
		}
	}

	var _toggleFull = function (section) {
		if ($('#' + section).hasClass('full')) {
			$('html').addClass('full-section');
		} else {
			$('html').removeClass('full-section');
		}
	}

	var _onNav = function (section, src) {
		var newSection = $('#' + section);
		var isOverlay = newSection.hasClass('overlay');

		if (isOverlay) {
			// pause any media
			if (section != 'media-overlay') {
				_media.pause();
			}
		} else {
			// close everything
			$('section').removeClass('open');
			_media.destroy();
		}

		$('html').removeClass('attract');

		_toggleCloseButton(section);
		_toggleFull(section);
		
		newSection.addClass('open');

		// sequence
		_initSequence(section);

		// last section
		_lastSection = $('html').attr('active-section');
		$('html').attr('active-section', section);

		_attract.stop();

		// section-specific stuff
		switch (section) {
			case 'attract':
				if (_translate) {
					_translate.reset();
				}
				
				if (_map) {
					_map.reset();
					_map.removePoints();
				}

				$('html').addClass('attract');
				$('.visited').removeClass('visited');
				
				_attract.start();
				
				break;
			case 'media-overlay':
				_media.playVideo(src);
				break;
			case 'main':
				$('.point').removeClass('highlight');
				$('.point').removeClass('selected');
				
				_initMainNav();
				_initMap();
				_initTouchPoints();
				
				break;
		}
	}

	var _onOverlayClose = function () {
		var section = $('#' + $('html').attr('active-section'));

		// hide
		section.removeClass('open');
		$('html').attr('active-section', _lastSection);

		_toggleCloseButton(_lastSection);
		_toggleFull(_lastSection);

		if (_lastSection == 'media-overlay') {
			// previously viewing media
			_media.play();
			_lastSection = _media.getNavSource();
		} else {
			_media.destroy();
			_initSequence(_lastSection);
		}
	}

	var _onClose = function () {
		var section = $('#' + $('html').attr('active-section'));

		// closing an overlay
		if (section.hasClass('overlay')) {
			_onOverlayClose();
			return;
		}

		$('section').removeClass('open');
		_media.destroy();

		_onNav('main');
		
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
			if (!_configPoints) _onNav('attract');
    	});

    	$(document).on('active.idleTimer', function (event, elem, obj, triggerevent) {
    		console.log('active');
    		_onNav('main');
    	});
	}

	var _initNav = function () {
		_addHighlightInteraction($('nav span, #close, .nav, .video button'));
		$('.with-point').prepend('<div class="point"><div /></div>');

		$('#close').on(_selectEvent, _onClose);
		$('.nav').on(_selectEvent, _onButtonNav);
		$('.video button').on(_selectEvent, _onVideo);

		// add targets to timeline buttons
		$('#timeline li').each(function () {
			var date = $(this).text().slug();

			$(this).data('target', [
				'legend-' + date,
				'ring-' + date
			]);
		});
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
		console.log('_onLoad');

		$('html').addClass('content-loaded');

		if ($('html').hasClass('data-loaded')) {
			_start();	
		}
	}

	var _start = function () {
		if ($('html').hasClass('loaded')) return;
		
		$('html').addClass('loaded');
		$(document).on('videoended', _onVideoEnded);

		_initTranslate();
		_initIdleTimer();
		_initLegends();
		_initMinimap();
		_initNav();

		// start attracting
		$(document).idleTimer('toggle');
	}

	var _addExtraClasses = function () {
		var classes = $.getQueryString('classes');

		if (typeof(classes) == 'string') {
			var arr = classes.split(',');

			$.each(arr, function (i, val) {
				$('html').addClass($.trim(val));
			});
		}
	}

	this.initialize = function () {
		_addExtraClasses();

		// listen for load events
		$(document).off('redwoodmodel');
		$(document).on('redwoodmodel.error', _onError);
		$(document).on('redwoodmodel.success', _onData);
		
		$(document).on('imgerror', _onError);
		$(window).on('load', _onLoad);

		// glyphs
		$('.en-sample').first().clone().addClass('medium').appendTo('#preload');
		$('.en-sample').first().clone().addClass('semibold').appendTo('#preload');
		$('.cn-sample').first().clone().addClass('medium').appendTo('#preload');
		$('.cn-sample').first().clone().addClass('semibold').appendTo('#preload');

		$('#languages li, #btn-credits').contents().wrap('<span />');

		// data
		var foo = new RedwoodModel();
	}

	this.initialize();
}
