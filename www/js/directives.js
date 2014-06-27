var map;

angular.module('starter.directives', [])

.directive('map', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      onCreate: '&'
    },
    link: function($scope, $element, $attr) {
      var mapOptions = {
          center: new google.maps.LatLng(18.61579, 73.911238),
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        
      if(map) {
        $scope.onCreate({
          map:map
        });
      }
      
      function initialize() {
        map = new google.maps.Map($element[0], mapOptions);

        $scope.onCreate({
          map: map
        });

        // Stop the side bar from dragging when mousedown/tapdown on the map
        google.maps.event.addDomListener($element[0], 'mousedown', function(e) {
          e.preventDefault();
          return false;
        });
      }

      google.maps.event.addDomListener(window, 'load', initialize);
    }
  }
});