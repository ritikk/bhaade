angular.module('starter.controllers', [])

.controller('MapCtrl', function($scope, $ionicLoading) {
  var searchInput = document.getElementById('mapSearch');
  var options = {
    types: ['geocode'], //this should work !
    componentRestrictions: {
      country: "in"
    }
  };
  var autocomplete = new google.maps.places.Autocomplete(searchInput, options);



  var marker = new google.maps.Marker({
    map: null,
    anchorPoint: new google.maps.Point(0, -29)
  });

  var infowindow = new google.maps.InfoWindow();

  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    infowindow.close();
    marker.setVisible(false);
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      return;
    }

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
      $scope.map.fitBounds(place.geometry.viewport);
    } else {
      $scope.map.setCenter(place.geometry.location);
      $scope.map.setZoom(17); // Why 17? Because it looks good.
    }
    marker.setIcon( /** @type {google.maps.Icon} */ ({
      url: place.icon,
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(35, 35)
    }));
    marker.setPosition(place.geometry.location);
    marker.setMap($scope.map);
    marker.setVisible(true);

    var address = '';
    if (place.address_components) {
      address = [
        (place.address_components[0] && place.address_components[0].short_name || ''), (place.address_components[1] && place.address_components[1].short_name || ''), (place.address_components[2] && place.address_components[2].short_name || '')
      ].join(' ');
    }

    infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
    infowindow.open($scope.map, marker);
  });

  $scope.mapCreated = function(map) {
    $scope.map = map;
    autocomplete.bindTo('bounds', $scope.map);
  };

  $scope.centerOnMe = function() {
    console.log("Centering");
    if (!$scope.map) {
      return;
    }

    $scope.loading = $ionicLoading.show({
      content: 'Getting current location...',
      showBackdrop: false
    });

    navigator.geolocation.getCurrentPosition(function(pos) {
      console.log('Got pos', pos);
      var myLatLong = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      $scope.map.setCenter(myLatLong);
      /*$scope.marker = new google.maps.Marker({
                                                                                 position:myLatLong,
                                                                                 map: $scope.map,
                                                                                 title: "Your location"
                                                                                 });*/
      $scope.accuracy = pos.coords.accuracy;
      $scope.loading.hide();
    }, function(error) {
      alert('Unable to get location: ' + error.message);
    });
  };
});