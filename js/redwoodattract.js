var RedwoodAttract = function () {
	var _inst = this;
	var _frames = 23;
	var _timer;

	this.start = function () {
		if (_timer) clearTimeout(_timer);
		$('html').addClass('attract-anim');
	}

	this.stop = function () {
		if (_timer) clearTimeout(_timer);
		$('html').removeClass('attract-anim');
	}

	var _onEnd = function () {
		_inst.stop();
		_timer = setTimeout(_inst.start, 50);
	}

	this.initialize = function () {
		var i = 0;

		while (i < _frames) {
			var img = $('<img />', {
				src: 'images/attract/attract_' + (i + 1) + '.png' 
			});

			img.css('animation-delay', (i * .1) + 's');
			$('#attract-frames').append(img);

			i++;
		}

		$('#attract-frames img').last().on('animationend', _onEnd);
	}

	this.initialize();
}
