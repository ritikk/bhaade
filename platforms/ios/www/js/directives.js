angular.module('starter.directives', [])

.directive('map', function() {
  return {
    restrict: 'E',
    scope: {
      onCreate: '&'
    },
    link: function($scope, $element, $attr) {
      function initialize() {
        var mapOptions = {
          center: new google.maps.LatLng(18.61579, 73.911238),
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          streetViewControl: false,
          panControl: false,
          zoomControl: false,
          mapTypeControl: false
        };
        var map = new google.maps.Map($element[0], mapOptions);

        $scope.onCreate({
          map: map
        });

        // Stop the side bar from dragging when mousedown/tapdown on the map
        google.maps.event.addDomListener($element[0], 'mousedown', function(e) {
          e.preventDefault();
          return false;
        });
      }

      ionic.Platform.ready(function() { 
        initialize();
      });
      //google.maps.event.addDomListener(window, 'load', initialize);
    }
  }
});