var RedwoodModel = function () {
	var _endpoint = 'https://giants.calacademy.org/rest/';
	var _callbackData = { callback: '_jqjsp' };
	var _timeout = 60000;

	var _data = {
		'credits': 'redwood-credits',
		'popups': 'redwood-popups',
		'sections': 'redwood-sections',
		'hotspots': 'redwood-hotspots'
	};

	var _onSuccess = function () {
		$(document).trigger('redwoodmodel.success', [_data]);
	}

	var _onError = function () {
		$(document).trigger('redwoodmodel.error');
	}

	var _onData = function (key, data) {
		_data[key] = data;

		var success = true;

		$.each(_data, function (i, val) {
			if (!$.isArray(val)) {
				success = false;
				return false;
			}
		});

		if (success) {
			_onSuccess();	
		}
	}

	var _requestJsonp = function (path, success, error) {
		$.jsonp({
			timeout: _timeout,
			data: _callbackData,
			url: path,
			success: function (data, textStatus) {
				success(data);
			},
			error: _onError
		});
	}

	this.initialize = function () {
		$.each(_data, function (key, val) {
			var url = _endpoint + val + '.jsonp';

			// var url = 'jsonp/' + val + '.jsonp';

			_requestJsonp(url, function (data) {
				_onData(key, data);
			});
		});
	}

	this.initialize();
}
