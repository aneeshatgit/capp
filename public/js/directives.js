'use strict';

/* Directives */

angular.module('cdm.directives', []).
  directive('appVersion', function (version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }).
  directive('captcha', function () {
    return function(scope, elm, attrs) {
      scope.$watch('public_key', function(nv, ov) {
        if(nv!=null){
          Recaptcha.create(nv, 'captcha', {
            theme: 'white'
          });
        }
      });
    };
  }).
  directive('notifier', function () {
    return function(scope, elm, attrs) {
      console.log('in directive');
      scope.$watch('notify', function(nv, ov){
        if(nv) {
          console.log('in green visibile');
          elm.removeClass('notify');
        } else {
          console.log('in green invisibile');
          elm.addClass('notify');
        }
      })
    };
  }).
  directive('modalNotifier', function () {
    return function(scope, elm, attrs) {
      scope.$watch('modalNotify', function(nv, ov){
        if(nv) {
          elm.removeClass('notify');
        } else {
          elm.addClass('notify');
        }
      })
    };
  }).
  directive('errorBar', function () {
    return function(scope, elm, attrs) {
      console.log('in directive of error bar');
      scope.$watch('errorsExist', function(nv, ov){
        if(nv) {
          //console.log('in green visibile');
          elm.removeClass('notify');
        } else {
          //console.log('in green invisibile');
          elm.addClass('notify');
        }
      })
    };
  }).
  directive('tooltipControl', function() {
    return {
      link: function(scope, element, attr) {
        var htmlProp = attr.tooltipHtml;
        var placeProp = attr.tooltipPos;
        if (htmlProp==undefined){
          htmlProp = false;
        } 
        if (placeProp==undefined){
          placeProp = 'auto';
        }
        $(element[0]).tooltip({title: attr.tooltipControl, placement: placeProp, html: htmlProp});
      }
    };
  }).
  directive('htmlText', function() {
      return {
        link: function(scope, element, attr) {
          scope.$watch('missingInfoUpdate', function(){
            if(scope.selectedRow!=null){
              if(scope.addressArr[scope.selectedRow].infoHtml=="<ul></ul>"){
                $(element[0]).html("<ul><li>Minimum address data requirements are compliant.</li></ul>");
              } else {
                $(element[0]).html(scope.addressArr[scope.selectedRow].infoHtml);
              }
            }
          });
          scope.$watch('selectedRow', function(){
            if(scope.selectedRow!=null){
              if(scope.addressArr[scope.selectedRow].infoHtml=="<ul></ul>"){
                $(element[0]).html("<ul><li>Minimum address data requirements are compliant.</li></ul>");
              } else {
                $(element[0]).html(scope.addressArr[scope.selectedRow].infoHtml);    
              }
            }
          })
        }
      };
  }).
  directive('addressAutocomplete', function ($timeout) {
    return function(scope, elm, attrs) {

      var componentForm = {
        street_number: 'short_name',
        route: 'long_name',
        locality: 'long_name',
        administrative_area_level_1: 'short_name',
        country: 'long_name',
        postal_code: 'short_name'
      };


      // Create the autocomplete object, restricting the search
      // to geographical location types.
      //console.log
      var autocomplete = new google.maps.places.Autocomplete(elm[0],{ types: ['geocode'] });
      // When the user selects an address from the dropdown,
      // populate the address fields in the form.
      google.maps.event.addListener(autocomplete, 'place_changed', function() {
        fillInAddress();
      });

      function fillInAddress() {
        // Get the place details from the autocomplete object.
        var place = autocomplete.getPlace();

        for (var component in componentForm) {
          document.getElementById(component).value = '';
          //$(component).disabled = false;
        }

        // Get each component of the address from the place details
        // and fill the corresponding field on the form.
        for (var i = 0; i < place.address_components.length; i++) {
          var addressType = place.address_components[i].types[0];
          if (componentForm[addressType]) {
            var val = place.address_components[i][componentForm[addressType]];
            //document.getElementById(addressType).value = val;
            switch (addressType) {
              case 'street_number': scope.addressArr[scope.selectedRow].streetNumber = val; break;
              case 'route': scope.addressArr[scope.selectedRow].route = val; break;
              case 'locality': scope.addressArr[scope.selectedRow].locality = val; break;
              case 'administrative_area_level_1': scope.addressArr[scope.selectedRow].admAreaLevel1 = val; break;
              case 'country': scope.addressArr[scope.selectedRow].country = val; break;
              case 'postal_code': scope.addressArr[scope.selectedRow].postalCode = val; break;
            }
          }
        }
        scope.addressArr[scope.selectedRow].googleAddress = place.formatted_address;
        scope.lat = place.geometry.location.lat();
        scope.lng = place.geometry.location.lng();
        scope.addressArr[scope.selectedRow].x = scope.lat;
        scope.addressArr[scope.selectedRow].y = scope.lng;

        var myLatlng = new google.maps.LatLng(scope.lat,scope.lng);
        
        var map = scope.mapForScope;

        map.setCenter(myLatlng);
        
        google.maps.event.trigger(map, 'resize');

        if(scope.marker!=null) {
          scope.marker.setMap(null);
        }

        scope.marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title:"Your Address"
        });
        //console.log('resizing in addre dire');
        //scope.resizing++;

        scope.$apply();

      }
    }
  }).
  directive('maps', function ($timeout) {
    return {
      link: function (scope, elem, attrs) {
        
        //render a basic map
        var mapOptions, map;
        var latitude = attrs.latitude;
        var longitude = attrs.longitude, 

        latitude = latitude && parseFloat(latitude, 10) || 43.074688;
        longitude = longitude && parseFloat(longitude, 10) || -89.384294;

        mapOptions = {
          zoom: parseInt(attrs.zoom) || 8,
          center: new google.maps.LatLng(latitude, longitude)
        };
        map = new google.maps.Map(elem[0], mapOptions);

        scope.mapForScope = map;

        scope.$watch('selectedRow', function(nv, ov) {
          if(nv!=null && scope.selectedRow!=null) {
            var x = scope.addressArr[scope.selectedRow].x;
            var y = scope.addressArr[scope.selectedRow].y;
            if(x!=null && y!=null) {
              map.setCenter(new google.maps.LatLng(x, y));
              google.maps.event.trigger(map, 'resize');
              scope.marker = new google.maps.Marker({
                position: new google.maps.LatLng(x, y),
                map: map,
                title: "Your Address"
              })
            }
          }
        });

        scope.$watch('visibleTab', function(nv, ov){
          if(nv=='address'){
            console.log('address change..');
            $timeout(function(){ resizeMap(); }, 100);
          }
        });
        function resizeMap() {
          google.maps.event.trigger(map, 'resize');
        }
      }
    }
  }).
  directive('editPhoneModal', function() {
      console.log('edit phone modal.')
      return {
        link: function(scope, element, attr) {
          scope.$watch('editPhoneModalShow', function(nv) {
            if(nv){
              $(element[0]).modal({show: true, backdrop: "static"});
            } else {
              $(element[0]).modal('hide');
            }
          });
        }
      };
  }).
  directive('deliveryMethodModal', function() {
      return {
        link: function(scope, element, attr) {
          scope.$watch('deliveryMethodModalShow', function(nv) {
            if(nv){
              $(element[0]).modal({show: true, backdrop: "static"});
            } else {
              $(element[0]).modal('hide');
            } 
          });
        }
      };
  }).
  directive('codeEntryModal', function() {
      return {
        link: function(scope, element, attr) {
          scope.$watch('codeEntryModalShow', function(nv) {
            if(nv){
              $(element[0]).modal({show: true, backdrop: "static"});
            } else {
              $(element[0]).modal('hide');
            }
          });
        }
      };
  }).
  directive('resultModal', function() {
      return {
        link: function(scope, element, attr) {
          scope.$watch('resultModalShow', function(nv) {
            if(nv){
              $(element[0]).modal({show: true, backdrop: "static"});
            } else {
              $(element[0]).modal('hide');
            }
          });
        }
      };
  });

