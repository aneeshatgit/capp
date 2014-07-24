'use strict';

// Declare app level module which depends on filters, and services

angular.module('capp', [
  'capp.controllers',
  'capp.filters',
  'capp.services',
  'capp.directives',
  'ngRoute'
]).
config(function ($routeProvider, $locationProvider) {
  $routeProvider.
    when('/alertsend', {
      templateUrl: 'partials/alertsend',
      controller: 'alertSendController'
    }).
    when('/alertstatus/:id', {
      templateUrl: 'partials/alertstatus',
      controller: 'alertStatusController'
    }).
    when('/testapp', {
      templateUrl: 'partials/testapp',
      controller: 'testAppController'
    }).
    when('/testclient', {
      templateUrl: 'partials/testclient',
      controller: 'testClientController'
    }).
    when('/allalerts', {
      templateUrl: 'partials/allalerts',
      controller: 'allAlertsController'
    }).
    when('/testalertget', {
      templateUrl: 'partials/testalertget',
      controller: 'testAlertGetController'
    }).
    otherwise({
      redirectTo: '/alertsend'
    });

  $locationProvider.html5Mode(true);
});
