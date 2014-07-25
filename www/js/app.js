angular.module('starter', ['ionic', 'starter.controllers', 'starter.directives', 'starter.services','elasticsearch'])

.run(function($ionicPlatform) {
	$ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if(window.cordova && window.cordova.plugins.Keyboard) {
			//cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			//cordova.plugins.Keyboard.disableScroll(true)
		}
		if(window.StatusBar) {
			// org.apache.cordova.statusbar required
			//StatusBar.hide();
		}
		
		try {
		  FB.init({ appId: "1459979374258261", nativeInterface: CDV.FB, useCachedDialogs: false });
		  //document.getElementById('data').innerHTML = "";
		  } catch (e) {
		  alert(e);
		}
	});
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // setup an abstract state for the tabs directive
    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html"
    })

    // Each tab has its own nav history stack:

    .state('tab.explore', {
      url: '/explore',
      views: {
        'tab-explore': {
          templateUrl: 'templates/tab-explore.html',
          controller: 'ExploreCtrl'
        }
      }
    })
    
    .state('tab.explore-map', {
      url: '/explore/map',
      views: {
        'tab-explore': {
          templateUrl: 'templates/tab-explore-map.html',
          controller: 'ExploreMapCtrl'
        }
      }
    })

    .state('tab.addListing', {
      url: '/add-listing',
      views: {
        'tab-add-listing': {
          templateUrl: 'templates/tab-add-listing.html',
          controller: 'AddListingCtrl'
        }
      }
    })
    .state('tab.add-photo', {
      url: '/add-listing/photo',
      views: {
        'tab-add-listing': {
          templateUrl: 'templates/tab-add-photo.html',
          controller: 'AddPhotoCtrl'
        }
      }
    })

    .state('tab.account', {
      url: '/account',
      views: {
        'tab-account': {
          templateUrl: 'templates/tab-account.html',
          controller: 'AccountCtrl'
        }
      }
    })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/explore');

});
