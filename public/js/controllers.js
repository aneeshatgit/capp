'use strict';

/* Controllers */
angular.module('cdm.controllers', []).
  controller('loginController', function ($scope, helperMethods, $http, $location) {
    $scope.voiceDelivery = true;
    $scope.smsDelivery = false;

    $scope.sendOtp = function() {
      //TO DO: VALIDATE PHONE NUMBER
      $scope.recaptcha_challenge_field = $('#recaptcha_challenge_field').val();
      $scope.recaptcha_response_field = $('#recaptcha_response_field').val();
      console.log('response: '+ $scope.recaptcha_response_field);

      helperMethods.generateOtp($scope, $http, $location);
    }
  }).


  controller('otpController', function ($scope, $http, $location, $cookies, $templateCache) {
    $templateCache.removeAll();    
    var uw = $scope.$watch('unauth', function(nv, ov){
      if (nv=='unauth') {
        uw();
        $scope.unauth = null;
        $location.path('/login');
      }
    });

    $scope.resendOtp = function() {
      $location.path('/login');
    }

    $scope.validateOtp = function() {
      $scope.priPhone = "00"+$scope.priPhone;
      var postData = {priPhone: $scope.priPhone, otp: $scope.otp};
      $http.post('/validateOtp', postData).
      success(function(data, status, headers, config){
        $scope.error="";
        if(data.validated){
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


  controller('addressController', function ($scope, validationService, $http, $location, $templateCache) {
    $templateCache.removeAll();    

    console.log("$scope.unauth"+ $scope.unauth);

    var uw = $scope.$watch('unauth', function(nv, ov){
      if (nv=='unauth') {
        console.log('redirecting to login: '+ $scope.unauth);
        uw();
        $scope.unauth = null;
        $location.path('/login');
      } else {
        $scope.priPhone = "00"+$scope.priPhone;
        $http.get('/getAddress/'+$scope.priPhone).
        success(function(data, status, headers, config){
          console.log('data: '+ data);
          if(data.validated!=undefined && data.validated==false) {
            $location.path('/login');
          } else {
            $scope.priPhone = data.address.priPhone;
            $scope.pendingPriPhone = data.address.pendingPriPhone;
            $scope.nrn = data.address.nrn;
            $scope.name = data.address.name;
            $scope.addressArr = data.address.addressData;


            //initializing display
            if($scope.addressArr!=null && $scope.addressArr.length>0){
              $scope.selectedRow=0;  
            }

            //check phone validation details
            initPhoneValidationStatus();

            //$scope.$apply();
            //check for missing info
            checkForMissingInfo();
          }
        }).
        error(function(data, status, headers, config){
          $scope.error = 'An unexpected error occurred. Please try again.'
        });
      }
    });
    
    $scope.infoMissing = false;
    $scope.missingInfoUpdate = 0;

    //function to check if any of the address information is missing. 
    function checkForMissingInfo() {
      var info = [];
      $scope.infoMissing = false;

      //check for primary phone number validation
      if($scope.pendingPriPhone!=null){
        info.push('Primary Phone Number (Basic Tab) must be validated.');
        $scope.infoMissing = true;
      }

      //check for nrn and name
      if($scope.nrn == null || $scope.nrn.trim() == '') {
        info.push('National Registration Number (Basic Tab) cannot be empty.') 
        $scope.infoMissing = true;
      }

      if($scope.name == null || $scope.name.trim() == '') {
        info.push('Name (Basic Tab) cannot be empty.') 
        $scope.infoMissing = true;
      }

      //check for individual address items.
      if($scope.addressArr!=null && $scope.addressArr.length>0){
        for (var k = 0; k< $scope.addressArr.length; k++) {
          var newInfo = info.slice(0);
          //check for google address
          if($scope.addressArr[k].postalCode==null || $scope.addressArr[k].postalCode.trim()=='') {
            newInfo.push('Address data (Address Tab) is invalid.');
            $scope.infoMissing = true;
          }
          //check for validation status of phones
          if(!$scope.addressArr[k].fixedPhone1Validated){
            newInfo.push('Fixed Phone 1 (Additional Phones Tab) must be validated.');
            $scope.infoMissing = true;
          }
          //check for validation status of phones
          if(!$scope.addressArr[k].fixedPhone2Validated){
            newInfo.push('Fixed Phone 2 (Additional Phones Tab) must be validated.');
            $scope.infoMissing = true;
          }
          //check for validation status of phones
          if(!$scope.addressArr[k].mobilePhone1Validated){
            newInfo.push('Mobile Phone 1 (Additional Phones Tab) must be validated.');
            $scope.infoMissing = true;
          }
          //check for validation status of phones
          if(!$scope.addressArr[k].mobilePhone1Validated){
            newInfo.push('Mobile Phone 2 (Additional Phones Tab) must be validated.');
            $scope.infoMissing = true;
          }

          //add the info to address arr.
          $scope.addressArr[k].info = newInfo;
          $scope.addressArr[k].incomplete = false;

          var html = '<ul>';
          for(var m=0; m<$scope.addressArr[k].info.length; m++) {
            html = html + "<li>"+$scope.addressArr[k].info[m]+"</li>";
            $scope.addressArr[k].incomplete = true;
          }
          html = html+ '</ul>';
          $scope.addressArr[k].infoHtml = html;
          $scope.missingInfoUpdate++;
        }
      }

    }

    function initPhoneValidationStatus() {
      if($scope.pendingPriPhone!=null) {
        $scope.priPhoneValidated = false;
      } else {
        $scope.priPhoneValidated = true;
      }


      if($scope.addressArr ==null) {
        $scope.addressArr = [];
      }
      for (var i = 0; i < $scope.addressArr.length; i++) {
        if($scope.addressArr[i].pendingFixedPhone1!=null) {
          $scope.addressArr[i].fixedPhone1Validated = false;
        } else {
          $scope.addressArr[i].fixedPhone1Validated = true;
        }
        if($scope.addressArr[i].pendingFixedPhone2!=null) {
          $scope.addressArr[i].fixedPhone2Validated = false;
        } else {
          $scope.addressArr[i].fixedPhone2Validated = true;
        }
        if($scope.addressArr[i].pendingMobilePhone1!=null) {
          $scope.addressArr[i].mobilePhone1Validated = false;
        } else {
          $scope.addressArr[i].mobilePhone1Validated = true;
        }
        if($scope.addressArr[i].pendingMobilePhone2!=null) {
          $scope.addressArr[i].mobilePhone2Validated = false;
        } else {
          $scope.addressArr[i].mobilePhone2Validated = true;
        }
      }
    }

    //validate phone


    //add address to table
    $scope.addAddress = function() {
      //hide any notifications.
      $scope.notify = false;
      $scope.errorsExist = false;


      if($scope.addressName==null || $scope.addressName.trim()==''){
        return;
      }

      if($scope.addressArr.length==3) {
        $scope.errorsExist = true;
        $scope.errors = "Maximum of 3 addresses can be added."
        return;
      } 

      if($scope.addressArr!=null){
        for (var i = 0 ; i < $scope.addressArr.length; i++) {
          if($scope.addressName == $scope.addressArr[i].addressName){
            $scope.errorsExist = true;
            $scope.errorsExist = "Address already exists."
          }
        }
      }


      //TODO: Check if address already exists.
      var postData = {addressName: $scope.addressName};
      var adName = $scope.addressName;

      //clear the the address add field.
      $scope.addressName = "";

      $http.post('/addNewAddress', postData).
      success(function(data, status, headers, config){
        //notify about new address
        $scope.notify = true;
        $scope.notification = "New Address added successfully. Please complete details in the following tabs to update your information.";



        if($scope.addressArr==null) {
          $scope.addressArr=[];
        }
        $scope.addressArr.push({addressName: adName, _id: data.id});
        $scope.selectedRow = $scope.addressArr.length-1;
        initPhoneValidationStatus();

        checkForMissingInfo();
      }).
      error(function(data, status, headers, config){
        $scope.error = 'An unexpected error occurred. Please try again.'
      });
    }

    $scope.selectAddress = function(idx) {
      $scope.selectedRow = idx;
    }

    //function to address logoff
    $scope.logoff = function() {
      $http.get('/logoff').
      success(function(data, status, headers, config){
        $location.path('/login');
      }).
      error(function(data, status, headers, config){
        $scope.error = 'An unexpected error occurred. Please try again.' 
      })
    };

    //method to address tab click for the navbar
    $scope.tabClick = function(tab){
      console.log('tab : '+ tab);
      $scope.visibleTab = tab;
      $scope.notify = false;
      $scope.errorsExist = false;
    }

    //method to update the address data.
    $scope.updateAddress = function() {
      $scope.addressAdd = false;
      var postData = {priPhone: $scope.priPhone,
          nrn: $scope.nrn,
          name: $scope.name,
          addressData: $scope.addressArr };
      console.log('postdata: '+ postData);
      $http.post('/updateAddress', postData).
      success(function(data, status, headers, config){
        $scope.notify = true;
        $scope.notification = 'Address updated successfully!';
      }).
      error(function(data, status, headers, config){
        $scope.error = 'An unexpected error occurred. Please try again.'
      });
    }              

    $scope.deleteAddress= function(idx) {
      var postData = {id: $scope.addressArr[idx]._id};
      $http.post('/deleteAddress', postData).
      success(function(data, status, headers, config){
        $scope.addressArr.splice($scope.selectedRow, 1);
        if($scope.selectedRow==0) {
          $scope.selectedRow = null;
        } else {
          $scope.selectedRow--;
        }
        checkForMissingInfo();
      }).
      error(function(data, status, headers, config){
        $scope.error = 'An unexpected error occurred. Please try again.'
      });
    }



    $scope.editPhone = function(phoneKey){
      $scope.editPhoneModalShow = false;
      $scope.editPhoneModalShow = true;
      $scope.phoneKey = phoneKey;
    }

    $scope.saveNewPhone = function(){
      if(!validationService.validatePhoneNumber($scope.newPhoneNumber)) {
        //$scope.modalErrors = "Invalid phone number format."
        return;
      }

      //hide any notifications
      $scope.notify = false;
      $scope.errorsExist = false; 

      //$scope.editPhoneModalShow = true;
      var pd = {};
      //pd[$scope.changingNumber] = $scope.newPhoneNumber;
      //TODO: Call http post method to execute update phone

      //following fields are required at server side: 
      //req.body.changingNumber
      //req.body.newNumber
      //req.body.addIndex
      //req.body.phoneKey
      pd.newNumber = $scope.newPhoneNumber;
      pd.id = $scope.addressArr[$scope.selectedRow]._id;
      pd.phoneKey = $scope.phoneKey;
      pd.addressName = $scope.addressArr[$scope.selectedRow].addressName;

      //reset new phone
      $scope.newPhoneNumber=""

      $http.post('/updatePhoneNumber', pd).
      success(function(data, status, headers, config){
        $scope.editPhoneModalShow = false;
        if(data.status){
          $scope.notify = true;
          $scope.notification = "Phone number updated successfully. Be sure to validate the number to make it active.";
          switch(pd.phoneKey){
            case 'pendingPriPhone': 
              $scope.pendingPriPhone = pd.newNumber;
              $scope.priPhoneValidated = false;
              break;
            case 'pendingFixedPhone1': 
              $scope.addressArr[$scope.selectedRow].pendingFixedPhone1 = pd.newNumber;
              $scope.addressArr[$scope.selectedRow].fixedPhone1Validated = false;
              break;
            case 'pendingFixedPhone2': 
              $scope.addressArr[$scope.selectedRow].pendingFixedPhone2 = pd.newNumber;
              $scope.addressArr[$scope.selectedRow].fixedPhone2Validated = false;
              break;
            case 'pendingMobilePhone1': 
              $scope.addressArr[$scope.selectedRow].pendingMobilePhone1 = pd.newNumber;
              $scope.addressArr[$scope.selectedRow].mobilePhone1Validated = false;
              break;
            case 'pendingMobilePhone2': 
              $scope.addressArr[$scope.selectedRow].pendingMobilePhone2 = pd.newNumber;
              $scope.addressArr[$scope.selectedRow].mobilePhone2Validated = false;
              break;
          }
          checkForMissingInfo();
        } else {
          $scope.errorsExist = true;
          $scope.errors = "This primary phone number is tagged to another address."
        }
      }).
      error(function(data, status, headers, config){
        $scope.error = 'An unexpected error occurred. Please try again.'
      });
    }

    $scope.sendValidationCodeAfterDeliveryMethod = function(deliveryMethod, newNumberKey) {
      var pd = {}
      if(newNumberKey == 'pendingPriPhone') {
        pd.phoneNumber = $scope.pendingPriPhone;  
      } else {
        pd.phoneNumber = $scope.addressArr[$scope.selectedRow][newNumberKey];  
      }
      
      $scope.validatingNumber = pd.phoneNumber;
      

      pd.deliveryMethod = deliveryMethod;

      $http.post('/sendModifyOtp', pd).
      success(function(data, status, headers, config) {
        //create notification on the modal.
        $scope.deliveryMethodModalShow = false;
        $scope.codeEntryModalShow = true;
      }).
      error(function(data, status, headers, config){
        $scope.error = 'An unexpected error occurred. Please try again.'
      });
    }

    $scope.sendValidationCode = function(validationNumberType) {
      //hide any notifications.
      $scope.notify = false;
      $scope.errorsExist = false; 

      $scope.validationNumberType = validationNumberType;

      switch(validationNumberType) {
        case 'pendingPriPhone':
          $scope.deliveryMethodModalShow = true;
          break;
        case 'pendingFixedPhone1':
        case 'pendingFixedPhone2':
          $scope.sendValidationCodeAfterDeliveryMethod('voice', validationNumberType);
          break;
        case 'pendingMobilePhone1':
        case 'pendingMobilePhone2':
          $scope.sendValidationCodeAfterDeliveryMethod('sms', validationNumberType);
          break;
      }  
    }

    $scope.enterCode = function(num){
      //hide notifications
      $scope.notify = false;
      $scope.errorsExist = false; 

      $scope.codeEntryModalShow = true;
      $scope.validatingNumber = num;
    }


    $scope.validate = function() {
      //hide any notifications
      $scope.notify = false;
      $scope.errorsExist = false; 

      //create post data with 
      var pd = {};
      pd.phoneNumber = $scope.validatingNumber;
      pd.otp = $scope.valCode;
      pd.id = $scope.addressArr[$scope.selectedRow]._id;
      pd.numberKey = $scope.validationNumberType;
      
      //valcode reset
      $scope.valCode = "";

      //call http post method to check valCode.
      $http.post('/numChangeValidation', pd).
      success(function(data, status, headers, config) {
        //create notification on the modal.
        $scope.codeEntryModalShow = false;
        

        if(data.validated) {
          //show notifications.
          $scope.notify = true;
          $scope.notification = "Phone number validated successfully!";

          switch($scope.validationNumberType) {
            case 'pendingPriPhone': 
              $scope.priPhoneValidated = true;
              $scope.priPhone = $scope.pendingPriPhone;
              $scope.pendingPriPhone = null;
              break;
            case 'pendingFixedPhone1': 
              $scope.addressArr[$scope.selectedRow].fixedPhone1Validated = true;
              $scope.addressArr[$scope.selectedRow].fixedPhone1 = $scope.addressArr[$scope.selectedRow].pendingFixedPhone1;
              $scope.addressArr[$scope.selectedRow].pendingFixedPhone1=null;
              break;
            case 'pendingFixedPhone2': 
              $scope.addressArr[$scope.selectedRow].fixedPhone2Validated = true;
              $scope.addressArr[$scope.selectedRow].fixedPhone2 = $scope.addressArr[$scope.selectedRow].pendingFixedPhone2;
              $scope.addressArr[$scope.selectedRow].pendingFixedPhone2= null;
              break;
            case 'pendingMobilePhone1': 
              $scope.addressArr[$scope.selectedRow].mobilePhone1Validated = true;
              $scope.addressArr[$scope.selectedRow].mobilePhone1 = $scope.addressArr[$scope.selectedRow].pendingMobilePhone1
              $scope.addressArr[$scope.selectedRow].pendingMobilePhone1= null;
              break;
            case 'pendingMobilePhone2': 
              $scope.addressArr[$scope.selectedRow].mobilePhone2Validated = true;
              $scope.addressArr[$scope.selectedRow].mobilePhone2 = $scope.addressArr[$scope.selectedRow].pendingMobilePhone2
              $scope.addressArr[$scope.selectedRow].pendingMobilePhone2= null;
              break;
          }

          checkForMissingInfo();
        } else {
          $scope.errorsExist = true;
          $scope.errors = "Validation code is invalid. Please try again by clicking 'Enter Code' button."
        }
      }).
      error(function(data, status, headers, config){
        $scope.errorsExist = true;
        $scope.error = 'An unexpected error occurred. Please try again.'
      });

      //on success
      //display result modal
    }
    

  });
