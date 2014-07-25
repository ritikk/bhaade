angular.module('starter.controllers', [])

.controller('ExploreCtrl', function($scope, $location, es) {
  $scope.showMapView = function() {
    $location.path('/tab/explore/map');
  };
  
  $scope.search = function() {
    if($scope.searchFilter.length >= 3) {
      es.search({
        index: 'bhaade-dev',
        size: 50,
        type: 'listing',
        body: {
          query: {
            "query_string": {
              "query": $scope.searchFilter
            }
          }
        }
      }).then(function(resp) {
        available = [];
        var hits = resp.hits.hits;
        console.log(resp);
        for (var i = hits.length - 1; i >= 0; i--) {
          available[i] = hits[i]._source;
        };
        $scope.available = available;
      }, function(err) {
        console.log(err);
      });
    }
  };
})

.controller('AddListingCtrl', function($scope, $location, listingSvc) {
  $scope.listing = listingSvc.getListing();

  $scope.continue = function() {
    listingSvc.setListing($scope.listing);
    $location.path('/tab/add-listing/photo');
  };


})

.controller('AddPhotoCtrl', function($scope, cameraSvc, listingSvc, $ionicActionSheet, es, $ionicLoading, $location) {

  if (listingSvc.getListing().photo) {
    $scope.imageURI = listingSvc.getListing().photo;
  }

  var options = {
    quality: 39,
    destinationType: Camera.DestinationType.DATA_URL,
    targetWidth: 480,
    targetHeight: 480,
    sourceType: Camera.PictureSourceType.CAMERA,
    saveToPhotoAlbum: true
  };

  $scope.showActionSheet = function() {
    $ionicActionSheet.show({
      buttons: [{
        text: 'Library'
      }, {
        text: 'Camera'
      }],
      titleText: 'Select Source',
      cancelText: 'Cancel',
      buttonClicked: function(index) {
        options.sourceType = index;
        if (index === 0) {
          options.saveToPhotoAlbum = false;
        } else {
          options.saveToPhotoAlbum = true;
        }
        $scope.getPhoto();
        return true;
      }
    });
  };

  $scope.getPhoto = function() {
    cameraSvc.getPicture(options).then(function(imageData) {
      //console.log(imageData);
      $scope.imageURI = "data:image/jpeg;base64," + imageData;
      var listing = listingSvc.getListing();
      listing.photo = $scope.imageURI;
      listingSvc.setListing(listing);
    }, function(err) {
      console.err(err);
    });
  };

  $scope.save = function() {

    var listing = listingSvc.getListing();
    listing.createDate = new Date();
    listing.updateDate = new Date();
    listing.createBy = null;
    listing.updateBy = null;
    listing.active = true;
    listing.isProblemReported = false;
    listing.isDeleted = false;
    listing.user = null;
    listing.id = null;

    geocoder = new google.maps.Geocoder();
    var address = listing.address.concat(", ", listing.city, " ", listing.pincode);
    geocoder.geocode({
      'address': address
    }, function(results, status) {

      if (status == google.maps.GeocoderStatus.OK) {
        listing.lat = results[0].geometry.location.lat();
        listing.lng = results[0].geometry.location.lng();
        console.log("geocode coords" + results[0].geometry.location.toString());
      } else {
        console.err("Geocode was not successful for the following reason: " + status);
        alert("Geocode was not successful for the following reason: " + status);
        return;
      }
      //console.log(listing);
    });

    $scope.loading = $ionicLoading.show({
      content: 'Saving..',
      noBackdrop: true
    });
    // index a document
    es.index({
      index: 'bhaade-dev',
      type: 'listing',
      body: listing
    }, function(err, resp) {
      console.log(resp);
      console.err(err);
      $scope.loading.hide();
      alert(resp);
      alert(err);
    });
    $location.path("/tab/explore");
  };
})

.controller('AccountCtrl', function($scope) {
	if (typeof CDV == 'undefined') alert('CDV variable does not exist. Check that you have included cdv-plugin-fb-connect.js correctly');
	if (typeof FB == 'undefined') alert('FB variable does not exist. Check that you have included the Facebook JS SDK file.');
    
	$scope.login = function() {
		FB.login(
				 function(response) {
				 alert(JSON.stringify(response));
				 if (response.authResponse) {
					FB.api(
						"/me",
						function (response) {
						  if (response && !response.error) {
							alert(JSON.stringify(response));
						  }
						}
					);
				 } else {
				 alert('not logged in');
				 }
				 },
				 { scope: "email" }
				 );
	};
})

.controller('ExploreMapCtrl', function($scope, $ionicLoading, placeSvc, es) {
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

  var available = [];

  var infowindow = new google.maps.InfoWindow();

  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    infowindow.close();
    marker.setVisible(false);
    var place = autocomplete.getPlace();

    if (!place.geometry) {
      return;
    }

    placeSvc.setPlace(place);

    $scope.markPlace(place);

    $scope.showAvailableParkings();

  });

  $scope.showAvailableParkings = function() {
    $scope.loading = $ionicLoading.show({
      content: "Searching..",
      noBackdrop: true
    });
    var bounds = $scope.map.getBounds();
    console.log("showing for bounds:" + bounds.toString());
    var latLte = bounds.getNorthEast().lat();
    var latGte = bounds.getSouthWest().lat();
    var lngLte = bounds.getNorthEast().lng();
    var lngGte = bounds.getSouthWest().lng();
    // search for documents (and also promises!!)
    es.search({
      index: 'bhaade-dev',
      size: 50,
      type: 'listing',
      body: {
        query: {
          constant_score: {
            filter: {
              range: {
                lat: {
                  "gte": latGte,
                  "lte": latLte
                },
                lng: {
                  "gte": lngGte,
                  "lte": lngLte
                }
              }
            }
          }
        }
      }

    }).then(function(resp) {
      available = [];
      var hits = resp.hits.hits;
      console.log(resp);
      for (var i = hits.length - 1; i >= 0; i--) {
        var m = new google.maps.Marker({
          position: new google.maps.LatLng(hits[i]._source.lat, hits[i]._source.lng),
          map: $scope.map,
          title: hits[i]._source.address,
          icon: "http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png"
        });
        available[i] = m;
      };
      $scope.loading.hide();
    }, function(err) {
      console.log(err);
      $scope.loading.hide();
    });
  };

  $scope.markPlace = function(place) {
    infowindow.close();
    marker.setVisible(false);
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

    infowindow.setContent('<div><strong>' + place.name + '</strong><br />' + address + '</div>');
    infowindow.open($scope.map, marker);
  };

  $scope.mapCreated = function(map) {
    $scope.map = map;
    autocomplete.bindTo('bounds', $scope.map);
    $scope.addNavigateButton();
    if (placeSvc.getPlace()) {
      $scope.markPlace(placeSvc.getPlace());
    } else {
      $scope.centerOnMe();
    }
    /*es.ping({
      requestTimeout: 1000,
      hello: "elasticsearch!"
    }, function(error) {
      if (error) {
        console.error('elasticsearch cluster is down!');
      } else {
        console.log('All is well with elasticsearch');
      }
    });*/
  };

  $scope.addNavigateButton = function() {
    var btn = document.createElement('a');
    btn.className = "button button-icon icon ion-ios7-navigate-outline";
    btn.title = "Get my location";
    google.maps.event.addDomListener(btn, 'click', function() {
      $scope.centerOnMe();
    });
    btn.index = 1;
    $scope.map.controls[google.maps.ControlPosition.LEFT_TOP].push(btn);
  };

  $scope.centerOnMe = function() {
    console.log("Centering");
    if (!$scope.map) {
      return;
    }

    $scope.loading = $ionicLoading.show({
      content: 'Getting current location...',
      noBackdrop: true
    });

    navigator.geolocation.getCurrentPosition(function(pos) {
      console.log('Got pos', pos);
      var myLatLong = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      $scope.map.setCenter(myLatLong);
      marker = new google.maps.Marker({
        position: myLatLong,
        map: $scope.map,
        title: "Your location"
      });
      $scope.map.setZoom(17); // Why 17? Because it looks good.
      $scope.loading.hide();
      //TODO: fix this, hangs the app on start
      //$scope.showAvailableParkings();
    }, function(error) {
      alert('Unable to get location: ' + error.message);
      $scope.loading.hide();
    });
  };
});