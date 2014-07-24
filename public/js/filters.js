'use strict';

/* Filters */

angular.module('capp.filters', []).
  filter('availableReaders', function () {
    return function (items) {
    	//items = list.slice();
        for (var i = 0; i < items.length; i++) {
	      	if(items[i].containingPlan!="" && items[i].containingPlan!=null) {
    	  		items.splice(i,1);
      		}
      	}
      	return items;
    }
  });
