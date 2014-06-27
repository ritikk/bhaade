angular.module('starter.services', [])

.factory('placeSvc', function() {
  var p = null;
  return {
    getPlace : function() {
      return p;
    },
    setPlace : function(place) {
      p = place;
    }
  };
});
