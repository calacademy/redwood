var RedwoodMap = function (container, config) {
	var _map;
	var _points = [];
	var _iconSize = 40;

	var _img = {
		w: 1920,
		h: 1035
	};

	var _configPositions = function () {
		$('html').addClass('config-points');

		$(document).on('keyup', function (e) {
			if (e.keyCode != 32) return false;

			var obj = {};

			$.each(_points, function (i, val) {
				var id = $.trim($(val._icon).find('label').data('target'));
				obj[id] = val.getLatLng();
			});

			console.log(JSON.stringify(obj));

			return false;
		});
	}

	var _getBounds = function (offsetX, offsetY) {
		if (typeof(offsetX) != 'number') offsetX = 0;
		if (typeof(offsetY) != 'number') offsetY = 0;

		return [[offsetY, offsetX], [_img.h, _img.w]];
	}

	var _onZoomEnd = function (e) {
		var bounds = _getBounds();

		if (_map.getZoom() > 1.25) {
			bounds = _getBounds(400, 25);
		}

		_map.setMaxBounds(bounds);
	}

	this.reset = function () {
		if (_map) {
			_map.setView([0, 0], 0);
		}
	}

	this.hasPoints = function () {
		return (_points.length > 0);
	}

	this.removePoints = function () {
		$.each(_points, function (i, point) {
			point.remove();
		});

		_points = [];
	}

	this.addPoints = function (points) {
		points.each(function () {
			var target = $(this).data('target');
			var latlng = REDWOOD_CONFIG.points[target];
			var loc = [latlng.lat, latlng.lng];

			var point = L.marker(loc, {
				icon: L.divIcon({
					className: 'point first-view',
					iconSize: [_iconSize, _iconSize],
					iconAnchor: [_iconSize / 2, _iconSize],
					html: '<label data-target="' + target + '">' + $(this).html() + '</label><div class="inner"></div>'
				}),
				clickable: false,
				draggable: config
			});

			point.addTo(_map);
			_points.push(point);
		});

		if (config) _configPositions();
	}

	this.initialize = function () {
		var img = container.find('img');
		var url = img.attr('src');
		img.remove();

		_map = L.map(container.attr('id'), {
			zoom: 0,
			minZoom: 0,
			maxZoom: 2,
			zoomSnap: 0.25,
			center: [0, 0],
			attributionControl: false,
			zoomControl: false,
			maxBoundsViscosity: 0.5,
			bounceAtZoomLimits: false,
			crs: L.CRS.Simple
		});

		_map.on('zoomend', _onZoomEnd);

		// if (!Modernizr.touch) {
		// 	L.control.zoom({
		// 		position: 'topright'
		// 	}).addTo(_map);
		// }

		var bounds = _getBounds();
		L.imageOverlay(url, bounds).addTo(_map);
		
		_map.fitBounds(bounds);
		if (!config) _map.setMaxBounds(bounds);

		window.map = _map;
	}

	this.initialize();
}
