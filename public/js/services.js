'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('capp.services', []).
  value('version', '0.1').
  factory('helperMethods', function() {
    var factory = {};

    factory.getObjSize = function(obj) {
    	var size = 0, key;
    	for (key in obj) {
        	if (obj.hasOwnProperty(key)) size++;
    	}
    	return size;
	};

    return factory;
  });
