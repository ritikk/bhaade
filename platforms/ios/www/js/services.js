angular.module('starter.services', [])

.service('es', function (esFactory) {
  return esFactory({
    host: 'https://ls0ekyon:daldab3kw9eryvoc@box-5569319.us-east-1.bonsai.io:443'
  });
})

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
})

.factory('cameraSvc', ['$q', function($q) {

  return {
    getPicture: function(options) {
      var q = $q.defer();

      navigator.camera.getPicture(function(result) {
        // Do any magic you need
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, options);

      return q.promise;
    }
  }
}])

.factory('listingSvc', function () {
  var li = {city:"Pune"};
  return {
    getListing : function() {
      return li;
    } , 
    setListing : function(listing) {
      li = listing;
    }
  };
});
