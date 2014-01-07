'use strict';

/* Controllers */
angular.module('cdm.controllers', []).
  controller('loginController', function ($scope, userService, helperMethods, $http, $location) {
    $scope.sendOtp = function() {
      //TO DO: VALIDATE PHONE NUMBER
      //userService.priPhone = $scope.priPhone;
      //console.log("pri phone: "+userService.priPhone+"otp: ");
      
      helperMethods.generateOtp($scope, $http, $location);
    }
  }).


  controller('otpController', function ($scope, userService, $http, $location, $cookies) {
    $scope.$watch('priPhone', function(nv, ov){
      console.log('priPhone'+ nv)
      if(nv==null) {
        $location.path('/login');
      }
    });

    $scope.validateOtp = function() {
      var postData = {priPhone: $scope.priPhone, otp: $scope.otp};
      $http.post('/validateOtp', postData).
      success(function(data, status, headers, config){
        $scope.error="";
        if(data.validated){
          //$cookies.put('isLoggedIn', true);
          $location.path('/address');  
        } else {
          $location.path('/login');
        }
      }).
      error(function(data,status, headers, config){
        $scope.error = 'An unexpected error occurred. Please try again.'
      });
    }    
  }).


  controller('addressController', function ($scope, userService, $http, $location) {
    $scope.$watch('priPhone', function(nv, ov){
      if(nv==null) {
        $location.path('/login');
      } else {
        $http.get('/getAddress/'+$scope.priPhone).
        success(function(data, status, headers, config){
          console.log('data: '+ data);
          if(data.validated!=undefined && data.validated==false) {
            $location.path('/login');
          } else {
            $scope.priPhone = data.address.priPhone;
            $scope.nrn = data.address.nrn;
            $scope.name = data.address.name;
            $scope.addressLn1 = data.address.addressLn1;
            $scope.addressLn2 = data.address.addressLn2;
            $scope.zipCode = data.address.zipCode;
            $scope.fixedPhone1 = data.address.fixedPhone1;
            $scope.fixedPhone2 = data.address.fixedPhone2;
            $scope.mobilePhone1 = data.address.mobilePhone1;
            $scope.mobilePhone2 = data.address.mobilePhone2;
            $scope.x = data.address.x;
            $scope.y = data.address.y;        
          }
        }).
        error(function(data, status, headers, config){
          $scope.error = 'An unexpected error occurred. Please try again.'
        });

        $scope.logoff = function() {
          $http.get('/logoff').
          success(function(data, status, headers, config){
            $location.path('/login');
          }).
          error(function(data, status, headers, config){
            $scope.error = 'An unexpected error occurred. Please try again.' 
          })
        };

        $scope.updateAddress = function() {
          $scope.addressAdd = false;
          var postData = {priPhone: $scope.priPhone,
              nrn: $scope.nrn,
              name: $scope.name,
              addressLn1: $scope.addressLn1,
              addressLn2: $scope.addressLn2,
              zipCode: $scope.zipCode,
              fixedPhone1: $scope.fixedPhone1,
              fixedPhone2: $scope.fixedPhone2,
              mobilePhone1: $scope.mobilePhone1,
              mobilePhone2: $scope.mobilePhone2,
              x: $scope.x,
              y: $scope.y
              };
          console.log('postdata: '+ postData);
          $http.post('/updateAddress', postData).
          success(function(data, status, headers, config){
            $scope.addressAdd = true;
          }).
          error(function(data, status, headers, config){
            $scope.error = 'An unexpected error occurred. Please try again.'
          });
        }              
      }
    });

  });
