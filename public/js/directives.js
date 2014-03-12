'use strict';

/* Directives */

angular.module('ilt.directives', []).
  directive('appVersion', function (version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }).
  directive('drawCanvas', function () {
    return function(scope, elm, attrs) {
      scope.canvas = elm[0];
      var ctx = elm[0].getContext('2d');

      $(elm[0]).droppable({
        drop: function(ev, ui) {
          var pos = {x: ui.draggable.css('left'), y: ui.draggable.css('top')};
          $(ui.draggable.children()[0]).css('background-color', '#CD5C5C');
          scope.readerPositionChanged(ui.draggable.attr('id'), pos);
        }
      });


      function getCursorPosition(canvas, event) {
        var x, y;

        var canoffset = $(canvas).offset();
        x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
        y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;

        return {x: x, y: y};
      }

      elm.bind('click', function(e){
        if(!scope.drawButtonState){
          return;
        }

        var coord = getCursorPosition(elm[0], e);
        //add coordinates to active shape
        scope.activeShape.coordinates.push({x: coord.x, y: coord.y});
        var len = scope.activeShape.coordinates.length; 
        console.log('elm'+ elm);
        if(len==1) {
          ctx.font = '20px Arial';
          ctx.fillText(scope.activeShape.shapeName, scope.activeShape.coordinates[0].x, scope.activeShape.coordinates[0].y);
        }
        if(len>1) {
          ctx.moveTo(scope.activeShape.coordinates[len-2].x,scope.activeShape.coordinates[len-2].y);
          ctx.lineTo(scope.activeShape.coordinates[len-1].x,scope.activeShape.coordinates[len-1].y);
          ctx.stroke();
        }
      });

      scope.$watch('initDrawing', function(){
        ctx.clearRect(0, 0, elm[0].width, elm[0].height);
        ctx.beginPath();
        

        //draw plan
        if(scope.plan!=null && scope.plan.shapeList!=null){
          for (var i = 0; i < scope.plan.shapeList.length; i++) {
            if(scope.plan.shapeList[i].coordinates!=null){
              for (var j=0; j< scope.plan.shapeList[i].coordinates.length; j++){
                if(j==0) {
                  ctx.font = '20px Arial';
                  ctx.fillText(scope.plan.shapeList[i].shapeName,scope.plan.shapeList[i].coordinates[j].x, scope.plan.shapeList[i].coordinates[j].y);  
                }
                if(j+1<scope.plan.shapeList[i].coordinates.length){
                  ctx.moveTo(scope.plan.shapeList[i].coordinates[j].x, scope.plan.shapeList[i].coordinates[j].y);
                  ctx.lineTo(scope.plan.shapeList[i].coordinates[j+1].x, scope.plan.shapeList[i].coordinates[j+1].y);
                  ctx.stroke();
                }
              }
            }
          }
        }
      });
    };
  }).
  directive('formatShape', function () {
    return {
      transclude: true,
      template: "<div class='shape'><div style='display: inline-block; margin-left: 4px' ng-transclude></div>"+"<div class='shapedelete'>x</div></div>",
      link: function(scope, elm, attr) {
        console.log('elm: '+ $(elm.children().children()[1]));
        $(elm.children().children()[1]).bind('click', function() {
          scope.deleteShape(attr.formatShapeId, attr.formatShapeIndex);
        })
      }
    }
  }).
  directive('formatReader', function () {
    return {
      transclude: true,
      template: "<div class='reader'><div style='display: inline-block; margin-left: 4px; margin-right: 4px' ng-transclude></div>"+"</div>",
      link: function(scope, elm, attr) {
        if(attr.draggable){
          $(elm).draggable({
            revert: "invalid"
          });
        }

        if(attr.posX!="" && attr.posY!="") {
          $(elm.children()[0]).css('background-color', '#CD5C5C');
          elm.css('top', attr.posY);
          elm.css('left', attr.posX);
        }
      }
    }
  }).
  directive('formatTarget', function () {
    return {
      transclude: true,
      template: "<div class='target'><div style='display: inline-block; margin-left: 4px; margin-right: 4px' ng-transclude></div>"+"</div>",
      link: function(scope, elm, attr) {
        $(elm).draggable({
          revert: "invalid"
        });

        if(attr.posX!="" && attr.posY!="") {
          elm.css('top', attr.posY);
          elm.css('left', attr.posX);
          //elm.html();
        }
      }
    }
  }).
  
  directive('readerContainer', function() {
      return {
        link: function(scope, element, attr) {
          $(element).droppable();
        }
      };
  }).
  directive('shapeModal', function() {
      return {
        link: function(scope, element, attr) {
          scope.$watch('shapeModalShow', function(nv) {
            if(nv){
              $(element[0]).modal({show: true, backdrop: "static"});
            } else {
              $(element[0]).modal('hide');
            }
          });
        }
      };
  }).
  directive('disableButton', function () {
    return function(scope, elm, attrs) {
      scope.$watch('planName', function(){
        buttonEnableDisable();
      });
      scope.$watch('check', function(){
        buttonEnableDisable();
      });

      function buttonEnableDisable() {
        if(scope.planName==null || scope.planName.trim()==''){
          elm.attr("disabled", true);    
        } else {
          elm.attr("disabled", true);
          for (var i in scope.readerList) {
            if(scope.readerList[i].isSelected){
              elm.attr("disabled", false);
              return;    
            }
          }
        }
      }
    };
  }).
  directive('navPillsActivation', function($location) {
      return {
        link: function(scope, element, attr) {
          scope.$on('$locationChangeStart', function(next, current) { 
            var path = $location.path();
            var h = path.replace("/","");

            $(element[0]).find("a").each(function(){
              $(this).parent().removeClass('active');
              if($(this).attr('href')==h) {
                $(this).parent().addClass('active');
              }
            });
          });
        }
      };
  }).
  directive('trackCanvas', function () {
    return function(scope, elm, attrs) {
      scope.canvas = elm[0];
      var ctx = elm[0].getContext('2d');

      scope.$watch('initDrawing', function(){
        ctx.clearRect(0, 0, elm[0].width, elm[0].height);
        ctx.beginPath();
        

        //draw plan
        if(scope.plan!=null && scope.plan.shapeList!=null){
          for (var i = 0; i < scope.plan.shapeList.length; i++) {
            if(scope.plan.shapeList[i].coordinates!=null){
              for (var j=0; j< scope.plan.shapeList[i].coordinates.length; j++){
                if(j==0) {
                  ctx.font = '20px Arial';
                  ctx.fillText(scope.plan.shapeList[i].shapeName,scope.plan.shapeList[i].coordinates[j].x, scope.plan.shapeList[i].coordinates[j].y);  
                }
                if(j+1<scope.plan.shapeList[i].coordinates.length){
                  ctx.moveTo(scope.plan.shapeList[i].coordinates[j].x, scope.plan.shapeList[i].coordinates[j].y);
                  ctx.lineTo(scope.plan.shapeList[i].coordinates[j+1].x, scope.plan.shapeList[i].coordinates[j+1].y);
                  ctx.stroke();
                }
              }
            }
          }
        }
      });
    };
  });  


