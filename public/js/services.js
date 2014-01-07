'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('cdm.services', []).
  value('version', '0.1').
  factory('userService', function() {
  	var uData = {
  		isLoggedIn: false,
  		priPhone: ''
  	};
  	return uData;
  }).
  factory('helperMethods', function(){
  	var factory = {}
  	factory.generateOtp = function(scope, http, location){
      scope.error="";
      var postData = {priPhone: scope.priPhone};
      http.post('/generateOtp', postData).
      success(function(data, status, headers, config){
        scope.error="";
        console.log('changing location path');
        location.path('/otp');
      }).
      error(function(data, status, headers, config){
        scope.error = 'An unexpected error occurred. Please try again.'
      });

  	};

  	return factory;
  });
