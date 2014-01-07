'use strict';

/* Directives */

angular.module('cdm.directives', []).
  directive('appVersion', function (version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }).
  directive('notifier', function (version) {
    return function(scope, elm, attrs) {
    	console.log('in directive');
      scope.$watch('addressAdd', function(nv, ov){
      	if(nv) {
      		console.log('in green visibile');
      		elm.removeClass('notify');
      	} else {
      		console.log('in green invisibile');
      		elm.addClass('notify');
      	}
      })
    };
  });
