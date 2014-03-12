'use strict';

// Declare app level module which depends on filters, and services

angular.module('ilt', [
  'ilt.controllers',
  'ilt.filters',
  'ilt.services',
  'ilt.directives',
  'ngRoute'
]).
config(function ($routeProvider, $locationProvider) {
  $routeProvider.
    when('/allplans', {
      templateUrl: 'partials/allplans',
      controller: 'allPlansController'
    }).
    when('/allreaders', {
      templateUrl: 'partials/allreaders',
      controller: 'allReadersController'
    }).
    when('/drawplan/:id', {
      templateUrl: 'partials/drawplan',
      controller: 'drawPlanController'
    }).
    when('/trackplan/:id', {
      templateUrl: 'partials/trackplan',
      controller: 'trackPlanController'
    }).
    when('/datapost', {
      templateUrl: 'partials/datapost',
      controller: 'datapostController'
    }).
    otherwise({
      redirectTo: '/allplans'
    });

  $locationProvider.html5Mode(true);
});
