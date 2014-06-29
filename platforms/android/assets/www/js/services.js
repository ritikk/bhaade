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
});
