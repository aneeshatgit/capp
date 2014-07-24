'use strict';

/* Directives */

angular.module('capp.directives', []).
  directive('googleMap', function () {
    return function(scope, elm, attrs) {
      //render a basic map
      var mapOptions, map;
      var latitude = attrs.latitude;
      var longitude = attrs.longitude, 

      latitude = latitude && parseFloat(latitude, 10) || 43.074688;
      longitude = longitude && parseFloat(longitude, 10) || -89.384294;

      mapOptions = {
        zoom: parseInt(attrs.zoom) || 8,
        center: new google.maps.LatLng(latitude, longitude)
      };
      map = new google.maps.Map(elm[0], mapOptions);


      scope.alertArea = new google.maps.Polygon({
        //paths: triangleCoords,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35
      });

      scope.coord = [];

      google.maps.event.addListener(map, 'click', function(e) {
        scope.alertArea.setMap(null);
        scope.coord.push(e.latLng);
        scope.alertArea.setPath(scope.coord);
        scope.alertArea.setMap(map);
      });
    };
  }).
  directive('googleMapStatus', function () {
    return function(scope, elm, attrs) {
      //render a basic map
      var mapOptions, map;
      var latitude = attrs.latitude;
      var longitude = attrs.longitude, 

      latitude = latitude && parseFloat(latitude, 10) || 43.074688;
      longitude = longitude && parseFloat(longitude, 10) || -89.384294;

      mapOptions = {
        zoom: parseInt(attrs.zoom) || 8,
        center: new google.maps.LatLng(latitude, longitude)
      };
      map = new google.maps.Map(elm[0], mapOptions);

      scope.alertArea = new google.maps.Polygon({
        //paths: triangleCoords,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35
      });

      scope.$watch("coords", function(nv, ov) {
        if(nv!=null && nv.length!=0) {
          var newCoord = [];
          for(var i = 0 ; i < nv.length; i++) {
            newCoord.push(new google.maps.LatLng(nv[i].lat, nv[i].lng))
          }
          scope.alertArea.setMap(null);
          scope.alertArea.setPath(newCoord);
          scope.alertArea.setMap(map);
        }
      })
    }
  });



