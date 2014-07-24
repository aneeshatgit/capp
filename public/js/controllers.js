'use strict';

/* Controllers */
angular.module('capp.controllers', []).
  controller('alertSendController', function ($scope, $http, $location, $rootScope) {
    $scope.sendAlert = function() {
      var literalCoords = [];
      for (var i = 0; i < $scope.coord.length; i++) {
        literalCoords.push({lat: $scope.coord[i].lat(), lng: $scope.coord[i].lng()});
      }
      //http post
      var data = {literalCoords: literalCoords, message: $scope.alertContent}
      $http.post('/sendalert', data).success(function(data){
        $rootScope.passingArea = $scope.alertArea;
        $location.path("/alertstatus/"+data.id);
      }).error(function(){
        console.log('error');
      });
    }
  }).
  controller('alertStatusController', function ($scope, $http, $location, $rootScope, $routeParams) {
    //$scope.alertArea = $rootScope.passingArea;
    $scope.alertId = $routeParams.id;
    $scope.message = null;
    $scope.count = null;
    $http.get('/getalertdetails/'+$scope.alertId)
      .success(function(data){
          $scope.message = data.message;
          $scope.count = data.count;
          $scope.coords = data.alertArea;
      })
      .error(function(data){
        console.log('error');
      })

  }).
  controller('testClientController', function ($scope, $http, $location, $rootScope) {
    
    $scope.submitForm = function() {
      var data = {regId: $scope.regid};
      $http.post("/registerid", data).
        success(function(){
          console.log("success");
        }).
        error(function(){
          console.log("error");
        });
    }
  }).
  controller('testAppController', function ($scope, $http, $location, $rootScope) {
    var msg = io.connect('http://localhost:3000/app');
    msg.on('alert', function(data) {
      console.log('yes recieved the message: ' + data.msg);
      $scope.message = data.alertId;
      $scope.coords = data.coords;
      $scope.$apply();
    })
  }).  
  controller('testAlertGetController', function ($scope, $http, $location, $rootScope) {
    $scope.getAlert = function() {
      var pd = {alertId: $scope.alertId}
      $http.post('/irecieve/', pd)
        .success(function(data){
            $scope.message = data.msg;
        })
        .error(function(data){
          console.log('error');
        })
    }
    
  }).
  controller('allAlertsController', function ($scope, $http, $location, $rootScope) {
    $http.get('/getallalerts')
      .success(function(data) {
        $scope.alerts = data.alerts;
      })    
      .error(function(data){
        console.log('error');
      })
  });