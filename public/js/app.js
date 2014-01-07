'use strict';

// Declare app level module which depends on filters, and services

angular.module('cdm', [
  'cdm.controllers',
  'cdm.filters',
  'cdm.services',
  'cdm.directives',
  'ngRoute',
  'ngCookies'
]).
config(function ($routeProvider, $locationProvider) {
  $routeProvider.
    when('/login', {
      templateUrl: 'partials/login',
      controller: 'loginController'
    }).
    when('/otp', {
      templateUrl: 'partials/otp',
      controller: 'otpController'
    }).
    when('/address', {
      templateUrl: 'partials/address',
      controller: 'addressController'
    }).
    otherwise({
      redirectTo: '/login'
    });

  $locationProvider.html5Mode(true);
})/*.
run(function($location, userService, $rootScope, $cookies){
  $rootScope.$on( "$routeChangeStart", function(event, next, current) {
    if(!userService.isLoggedIn){
      console.log('user not logged in');
      if(next.templateUrl == "partials/otp" && userService.priPhone!="") {
        $location.path("/otp");
      } else if(next.templateUrl != "partials/login") {
        $location.path( "/login" );
      }
    } else {
      //do something here.
    }
  })
})*/;
