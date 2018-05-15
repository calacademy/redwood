var RedwoodMap = function (container, config) {
	var _map;
	var _points = [];
	var _iconSize = 40;

	var _img = {
		w: 1920,
		h: 1035
	};

	var _configPositions = function (els) {
		$('html').addClass('config-points');

		$(document).on('keyup', function (e) {
			if (e.keyCode != 32) return false;

			var obj = {};

			$.each(_points, function (i, val) {
				var id = $.trim($(val._icon).text());
				obj[id] = val.getLatLng();
			});

			console.log(JSON.stringify(obj));

			return false;
		});
	}

	this.reset = function () {
		if (_map) {
			_map.setView([0, 0], 0);
		}
	}

	this.addPoints = function (points) {
		var iconWidth = _iconSize;
		var iconHeight = _iconSize;

		$.each(points, function (i, point) {
			var target = $(this).data('target');
			var latlng = REDWOOD_CONFIG.points[target];

			var loc = [latlng.lat, latlng.lng];
			if (config) loc = [100, -100];

			var point = L.marker(loc, {
				icon: L.divIcon({
					className: 'point',
					iconSize: [iconWidth, iconHeight],
					html: '<label>' + target + '</label><div></div>'
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
		// @todo
		// markers shift position on zoom
		// @see https://stackoverflow.com/questions/49194008/leaflet-js-imageoverlay-zoom-changes-marker-position

		var img = container.find('img');
		var url = img.attr('src');
		img.remove();

		_map = L.map(container.attr('id'), {
			zoom: 0,
			minZoom: -1,
			maxZoom: 2,
			center: [0, 0],
			attributionControl: false,
			zoomControl: false,
			crs: L.CRS.Simple
		});

		var bounds = [[0, 0], [_img.h, _img.w]];
		L.imageOverlay(url, bounds).addTo(_map);
		
		_map.fitBounds(bounds);
		if (!config) _map.setMaxBounds(bounds);

		window.map = _map;
	}

	this.initialize();
}
