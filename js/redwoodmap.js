var RedwoodMap = function (container, config) {
	var _map;
	var _points = [];
	var _iconSize = 40;

	var _img = {
		w: 3840,
		h: 2070
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
			_map.setView([0, 0], 2);
		}
	}

	this.addPoints = function (points) {
		var iconWidth = _iconSize;
		var iconHeight = _iconSize;

		$.each(points, function (i, point) {
			var target = $(this).data('target');
			var latlng = REDWOOD_CONFIG.points[target];

			var point = L.marker([latlng.lat, latlng.lng], {
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
		var img = container.find('img');
		var url = img.attr('src');
		img.remove();

		_map = L.map(container.attr('id'), {
			minZoom: 1,
			maxZoom: 4,
			center: [0, 0],
			zoom: 2,
			attributionControl: false,
			zoomControl: false,
			crs: L.CRS.Simple
		});

		var southWest = _map.unproject([0, _img.h], _map.getMaxZoom() - 1);
		var northEast = _map.unproject([_img.w, 0], _map.getMaxZoom() - 1);
		var bounds = new L.LatLngBounds(southWest, northEast);

		L.imageOverlay(url, bounds).addTo(_map);
		_map.setMaxBounds(bounds);

		window.map = _map;
	}

	this.initialize();
}
