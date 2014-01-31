'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('cdm.services', []).
  value('version', '0.1').
  factory('validationService', function() {
    var factory = {};
    factory.validatePhoneNumber = function(phoneNumber) {
      //TO DO : write the validation logic for phone number
      if(!isNaN(parseInt(phoneNumber))) {
        return true;  
      } else {
        return false;  
      }
    };
    return factory;
  }).
  factory('helperMethods', function(){

  	var factory = {}
  	factory.generateOtp = function(scope, http, location){
      scope.errorsExist=false;
      scope.error="";
      var method = "voice";
      if (scope.smsDelivery) {
        method = "sms";
      }
      
      var postData = {priPhone: "00"+scope.cc+scope.priPhone, recaptcha_challenge_field: scope.recaptcha_challenge_field, 
        recaptcha_response_field: scope.recaptcha_response_field, method: method};
      console.log("postdata: "+ postData.recaptcha_response_field);
      http.post('/generateOtp', postData).
      success(function(data, status, headers, config){
        if(data.status) {
          scope.error="";
          location.path('/otp');
        } else {
          scope.errorsExist=true;
          scope.errors="Invalid Captcha";
          location.path('/login');
        }
      }).
      error(function(data, status, headers, config){
        scope.error = 'An unexpected error occurred. Please try again.'
      });

  	};

  	return factory;
  });
