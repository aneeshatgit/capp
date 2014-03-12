'use strict';

/* Controllers */
angular.module('ilt.controllers', []).
  controller('allPlansController', function ($scope, $http, $location) {


    //variable to hold all the values added to the reader list
    $scope.selectedReaders = [];
    $scope.check = 0;
    $scope.incCheck = function() {
    	$scope.check++;
    }


  	//get the data for all the plans defined so far. 
  	$http.get('/getallreaders').
  	success(function(data, status, headers, config){
  		$scope.readerList = data.allReaders;
  	}).
    error(function(data, status, headers, config){
		$scope.error = 'An unexpected error occurred. Please try again.'
	});

  	$http.get('/getallplans').
  	success(function(data, status, headers, config){
  		$scope.allPlans = data.allPlans;
  	}).
    error(function(data, status, headers, config){
		$scope.error = 'An unexpected error occurred. Please try again.'
	});




  	//define method for add plan
  	$scope.addPlan = function() {
  		var postData = {planName: $scope.planName};
  		//get all the selected readers
  		for (var i in $scope.readerList) {
  			if ($scope.readerList[i].isSelected) {
  				$scope.selectedReaders.push($scope.readerList[i]);
  			}
  		}

  		postData.readers = $scope.selectedReaders;


  		//make an ajax call to add the plan to the database. 
	  	$http.post('/saveplan', postData).
	  	success(function(data, status, headers, config){
	  		//on success add the plan to the scope array with the id. 
	  		$scope.allPlans.push(data.newPlan);
        $scope.readerList = data.newReaderList;
        $scope.selectedReaders = [];
	  		//empty the plan name text field and list of readers
	  		$scope.planName = "";
	  		for (var i in $scope.readerList) {
	  			$scope.readerList[i].isSelected = false;
	  		}
	  	}).
	    error(function(data, status, headers, config){
			$scope.error = 'An unexpected error occurred. Please try again.'
		});
  	}

  	//define method to draw a plan (navigate user to the drawplan page)
  	$scope.drawPlan = function(id) {
  		//navigate the user to the draw plan page (pass on the id variable.)
  		$location.path('/drawplan/'+id);
  	}

  	//define method to track the plan
  	$scope.trackPlan = function(id) {
  		//navigate the user to the track plan page (pass on the id variable.)
  		$location.path('/trackplan/'+id);
  	}

  	//define method to delete the plan
  	$scope.deletePlan = function(id, $index) {
  		//make an ajax call to remove the plan from database
  		var postData = {id: id};
	  	$http.post('/deleteplan', postData).
	  	success(function(data, status, headers, config){
	  		//on success delete the plan from the scope array with the id. 
	  		$scope.allPlans.splice($index, 1);
        $scope.readerList = data.newReaders;
	  	}).
	    error(function(data, status, headers, config){
			$scope.error = 'An unexpected error occurred. Please try again.'
		});
  	}

  }).

  controller('allReadersController', function ($scope, $http, $location) {
  	//get the data for all the readers defined so far. 
  	$http.get('/getallreaders').
  	success(function(data, status, headers, config){
  		$scope.allReaders = data.allReaders;
  	}).
    error(function(data, status, headers, config){
  		$scope.error = 'An unexpected error occurred. Please try again.'
	  });

  	//define method for add reader
  	$scope.addReader = function() {
  		var postData = {readerName: $scope.readerName};
  		postData.readerMacId = $scope.readerMacId;
  		//make an ajax call to add the plan to the database. 
	  	$http.post('/savereader', postData).
	  	success(function(data, status, headers, config){
	  		//on success add the reader to the scope array with the id. 
	  		$scope.allReaders.push(data.newReader);

	  		//empty the reader name and mac id on success.
	  		$scope.readerName = "";
	  		$scope.readerMacId = "";

	  	}).
	    error(function(data, status, headers, config){
			$scope.error = 'An unexpected error occurred. Please try again.'
		});
	}

  	//define method to delete a reader
  	$scope.deleteReader = function(id, $index) {
  		//make an ajax call to remove the reader from database
  		var postData = {id: id};
	  	$http.post('/deletereader', postData).
	  	success(function(data, status, headers, config){
	  		//on success delete the reader from the scope array with the index. 
	  		$scope.allReaders.splice($index, 1);
	  	}).
	    error(function(data, status, headers, config){
			  $scope.error = 'An unexpected error occurred. Please try again.';
		  });
  	}

  }).


  controller('drawPlanController', function ($scope, $http, $routeParams) {
  	var id = $routeParams.id;
    $scope.initDrawing = 0;
  	var BUTTON_DEFAULT_TEXT = "Add New Shape";
  	$scope.buttonText = BUTTON_DEFAULT_TEXT;

    //retrieve existing details for the plan. 
    $http.get('/getplandetails/'+id).
    success(function(data, status, headers, config){
      $scope.plan = data.plan;

      //draw all the existing shapes and readers on the map. 
      $scope.initDrawing++;

    }).
    error(function(data, status, headers, config){
      $scope.error = 'An unexpected error occurred. Please try again.'
    });



  	$scope.saveNewShape = function() {
  		if($scope.drawButtonState) {
  			return;
  		}
  		//add the new shape to the shape library space.
  		//$scope.plan.shapeList.push({shapeName: $scope.newShapeName});
  		$scope.activeShape = {shapeName: $scope.newShapeName, coordinates: []};
  		$scope.buttonText = "Drawing "+$scope.newShapeName+"...";
  		$scope.drawButtonState = true;
  		$scope.newShapeName = "";
  		$scope.shapeModalShow = false;
  	}

  	$scope.shapeComplete = function() {
  		$scope.buttonText = BUTTON_DEFAULT_TEXT;
  		$scope.drawButtonState = false;

      //post coordinates activeshape object to database.
      var postData = {planId: id, shape: $scope.activeShape};
      $http.post('/saveshape', postData).
      success(function(data, status, headers, config){
        //on success push the active shape to the list.
        $scope.plan.shapeList.push(data.newShape);
      }).
      error(function(data, status, headers, config){
        $scope.error = 'An unexpected error occurred. Please try again.';
      })   
  	}

    $scope.deleteShape = function(shapeId, shapeKey) {
      var postData = {planId: id, shapeId: shapeId};
      $http.post('/deleteshape', postData).
      success(function(data, status, headers, config){
        //on success delete the active shape to the list.
        $scope.plan.shapeList.splice(shapeKey, 1);

        //clear shape from canvas
        $scope.initDrawing++;
      }).
      error(function(data, status, headers, config){
        $scope.error = 'An unexpected error occurred. Please try again.';
      })   

    }


    $scope.readerPositionChanged = function(rid, pos) {
      var postData = {planId: id, readerId: rid, pos: pos};
      $http.post('/changereaderposition', postData).
      success(function(data, status, headers, config){

      }).
      error(function(data, status, headers, config){
        $scope.error = 'An unexpected error occurred. Please try again.';
      });
    }
  }).


  controller('trackPlanController', function ($scope, $http, $routeParams) {
    var id = $routeParams.id;
    $scope.initDrawing = 0;
    $scope.positionList = [];

    var socket = io.connect('http://localhost');
    socket.on('dataupdate', function (data) {
      console.log("posArr: "+ data.posArr);
      $scope.positionList = data.posArr;
      $scope.$apply();
      

    });

    //retrieve existing details for the plan. 
    $http.get('/getplandetails/'+id).
    success(function(data, status, headers, config){
      $scope.plan = data.plan;

      //draw all the existing shapes and readers on the map. 
      $scope.initDrawing++;

    }).
    error(function(data, status, headers, config){
      $scope.error = 'An unexpected error occurred. Please try again.'
    });    

  }).
  controller('datapostController', function ($scope, $http) {
    var postData= {posArr: [{x:"316px",y:"80px",targets:"Device 1, Device 2, Device 3"}]};
    $http.post('/datapost', postData);
  });
