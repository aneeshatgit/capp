module.exports = function(app, models, log, cache, io){
  var sock;
  io.sockets.on('connection', function (socket) {
    //socket.emit('news', { hello: 'world' });
    sock = socket;
  });

  updatePlanAndReaderCache();

  app.get('/', function(req, res){
  	res.render('index');
  });


  /*
  * This service will be used to render the page used to display all plans
  */
  app.get('/partials/allplans', function(req, res){
    res.render('partials/allplans');
  });


  /*
  * This service will be used to render the page used to display all readers
  */
  app.get('/partials/allreaders', function(req, res){
    res.render('partials/allreaders');
  });

  /*
  * This service will be used to render the page used draw a plan
  */
  app.get('/partials/drawplan', function(req, res){
    res.render('partials/drawplan');
  });

  /*
  * This service will be used to render the page used to track a plan
  */
  app.get('/partials/trackplan', function(req, res){
    res.render('partials/trackplan');
  });

  /*
  * This service will be used to send data for all plans.
  */
  app.get('/getallplans', function(req, res){
      log.info('Invoked getallplans');
      //find all existing plans
      models.plan.find({}).populate('readerList').exec(function(err, plans){
        if(err) {
          throw err;
        } else {
          log.info('Successfully retrieved all records: ' + plans);
          res.send({allPlans: plans});
        }
      });
  });

  /*
  * This service will be used to save a plan.
  */
  app.post('/saveplan', function(req, res){
    log.info('Invoked saveplan with data: '+ JSON.stringify(req.body));
    var readerIds = [];
    //var q = [];
    for (var i=0; i < req.body.readers.length; i++) {
      readerIds.push(req.body.readers[i]._id);
      //q.push({_id: req.body.readers[i]._id});
    }

    var plan = new models.plan({planName: req.body.planName, readerList: readerIds});
    
    //find all readers that were selected by user. 
    //save plan to get plan id. 
    plan.save(function(err, plan){
      log.info('Updated plan: ' + JSON.stringify(plan));
      var pid = plan._id;
      models.plan.findOne({_id: pid}).populate("readerList").exec(function(err, plan) {
        var list = plan.readerList;
        for(var j=0; j< list.length; j++) {
          list[j].containingPlan = pid; 
          var len = list.length;
          var jStable = j;
          list[j].save(function(err, reader) {
            if(jStable==len-1) {
              updatePlanAndReaderCache();
              models.reader.find({}, function(err, readers){
                res.send({newPlan: plan, newReaderList: readers});
              });
            }
          });
        }
      });
    });
  });

  function updatePlanAndReaderCache() {
    models.plan.find({}).populate("readerList").exec(function(err, plans) {
      cache.put("plans", plans);
    });
    models.reader.find({}).populate("containingPlan").exec(function(err, readers) {
      cache.put("readers", readers);
      var readerList = {};
      for (var i = 0; i< readers.length; i++) {
        //load all readers in reader list based on id.
        readerList[readers[i]._id] = {};
        readerList[readers[i]._id] = {x: readers[i].readerPositionX, y: readers[i].readerPositionY, macId: readers[i].readerMacId};
        if(readers[i].containingPlan != null) {
          readerList[readers[i]._id].peerReaderIds = readers[i].containingPlan.readerList;
        }
      }


      var newReaderList={};
      //iterate through reader list
      for (var j in readerList) {
        var peers = readerList[j].peerReaderIds;
        var peerArr = [];
        //get the peer readers for each reader.
        if(peers!=null){

          for (var k =0; k< peers.length; k++) {
            log.info('peer list with details: ' + JSON.stringify(readerList[peers[k]]));
            var xNum = readerList[peers[k]].x;
            var yNum = readerList[peers[k]].y;
            var xn, yn;

            if(xNum!=null && yNum!=null){
              xNum = xNum.substring(0,xNum.length-2);
              yNum = yNum.substring(0,yNum.length-2);

              xn = parseInt(xNum);
              yn = parseInt(yNum);
            }


            var peerDetails = {x: xn,
              y: yn,
              macId: readerList[peers[k]].macId }
              peerArr.push(peerDetails);
          }
        }
        //store peers by mac id.
        newReaderList[readerList[j].macId] = peerArr;
        log.info('input mac id: ' +readerList[j].macId);
      }
      log.info("Peer reader list value: "+ JSON.stringify(newReaderList));
      cache.put("peerReadersByMacId", newReaderList);
    });
  }



  /*
  * This service will be used to delete a plan.
  */
  app.post('/deleteplan', function(req, res){
    log.info('Invoked deleteplan with id: ' + req.body.id);

    models.plan.findOne({_id: req.body.id}).populate("readerList").exec(function(err, plan){
      var list = plan.readerList;
      for(var j=0; j< list.length; j++) {
        list[j].containingPlan = null; 
        var len = list.length;
        var jStable = j;
        list[j].save(function(err, reader) {
          if(jStable==len-1) {
            plan.remove(function(err, product){
              updatePlanAndReaderCache();
              models.reader.find({}, function(err, readers){
                res.send({newReaders: readers});
              });
            });
          }
        });
      }
    });

    /*models.plan.findOne({_id: req.body.id}, function(err, plan){

      models.reader.find({}).where("_id").in(plan.readerList).exec(function(err, readers) {
        for (var j =0 ; j< readers.length; j++) {
          readers[j].containingPlan = null;
          var jStable = j;
          var len = readers.length;
          readers[j].save(function(err, reader){
            if(jStable==len-1) {
              plan.remove(function(err, plan) {
                updatePlanAndReaderCache();
                models.reader.find({}, function(err, readers){
                  res.send({newReaders: readers});
                });            
              });
            }
          });
        }
      });

    });*/
  });

  /*
  * This service will be used to get a plan's details
  */
  app.get('/getplandetails/:id', function(req, res){
    log.info('Invoked getplandetails with data: planId: '+ req.params.id);

    models.plan.findOne({_id: req.params.id}).populate("readerList").exec(function(err, plan){
      log.info('sending response: plan: '+ plan);
      res.send({plan: plan});
    });
  });


  /*
  * This service will be used to get all readers data
  */
  app.get('/getallreaders', function(req, res){
    log.info('Invoked getallreaders');
    //find all existing plans
    models.reader.find({}, function(err, readers){
      if(err) {
        throw err;
      } else {
        log.info('Successfully retrieved all readers: ' + readers);
        res.send({allReaders: readers});
      }
    });
  });


  /*
  * This service will be used to save a reader
  */
  app.post('/savereader', function(req, res){
    log.info('Invoked savereader with data: '+ JSON.stringify(req.body));
    var reader = new models.reader({readerName: req.body.readerName, readerMacId: req.body.readerMacId});
    reader.save(function(err, reader) {
      log.info('sending new reader: ' + reader);
      updatePlanAndReaderCache();
      res.send({newReader: reader});
    });
  });

  /*
  * This service will be used to delete a reader.
  */
  app.post('/deletereader', function(req, res){
    log.info('Invoked deletereader with data: ' + JSON.stringify(req.body));

    models.reader.findOne({_id: req.body.id}).populate("containingPlan").exec(function(err, reader){
      if(reader.containingPlan==null) {
        reader.remove(function(err, reader) {
          updatePlanAndReaderCache();
          res.send(200);
        });
      } else {
        models.plan.findOne({_id: reader.containingPlan}, function(err, plan){
          plan.readerList.splice(plan.readerList.indexOf(req.body.id),1);
          plan.save(function(err, plan){
            reader.remove(function(err, reader) {
              updatePlanAndReaderCache();
              res.send(200);
            });
          });
        });
      }
    });
  });


  /*
  * This service will be used to save a shape to a plan
  */
  app.post('/saveshape', function(req, res){
    log.info('Invoked saveshape with data:'+ JSON.stringify(req.body.planId));

    models.plan.findOne({_id: req.body.planId}, function(err, plan){
      plan.shapeList.push(req.body.shape);
      var newShape = plan.shapeList[plan.shapeList.length-1];
      plan.save(function(err){
        res.send({newShape: newShape});
      })
    });
  });

  /*
  * This service will be used to delete a shape from a plan.
  */
  app.post('/deleteshape', function(req, res){
    log.info('Invoked deleteshape with plan id: ' + req.body.planId + " and shape id: " + req.body.shapeId);

    //TO DO: delete all instances of readers from the plan where this reader is present.
    models.plan.findOne({_id: req.body.planId}, function(err, plan){
      if(err) {
        throw err;
      } else {
        var doc = plan.shapeList.id(req.body.shapeId).remove();
        plan.save(function(err) {
          if (err) {
            throw err;
          } else {
            res.send(200);
          }
        });
      }
    });
  });

  /*
  * This service will be used to change the position of a reader. 
  */
  app.post('/changereaderposition', function(req, res){
    log.info('Invoked changereaderposition with data: ' + req.body);

    //TO DO: delete all instances of readers from the plan where this reader is present.
    models.reader.findOne({_id: req.body.readerId}, function(err, reader){
      reader.readerPositionX = req.body.pos.x;
      reader.readerPositionY = req.body.pos.y;
      reader.save(function(err) {
        updatePlanAndReaderCache();
        res.send(200);
      });
    });
  });



  /*
  * This service will be used to display the page for location tracking for a plan id.
  */
  app.get('/loctracking', function(req, res){
    res.render('partials/trackplan');
  });

  /*
  * This is datapost test page.
  */
  app.get('/partials/datapost', function(req, res){
    res.render('partials/datapost');
  });


  /*
  * This service will be used to post data from the readers
  */
  app.post('/datapost', function(req, res){
    //req.body.readerMacId && req.body.targetList
    var readerMacId = req.body.readerMacId;
    var targetList = req.body.targetsList;
    log.info("Called Datapost service with data: "+ JSON.stringify(req.body));

        

    //store the list of targets attached to this mac id in the cache.
    var targetRepo = cache.get('targetRepo');
    if(targetRepo==null){
      targetRepo = {}
    }
    targetRepo[readerMacId] = targetList;
    cache.put('targetRepo', targetRepo);

    log.info("Value of target Repo: "+ JSON.stringify(targetRepo));

    

    var allReaders = cache.get('peerReadersByMacId');
    //get all the peer readers for this reader from the cache.
    var peerReaders = allReaders[readerMacId];

    var targetPos = {}
    //if no peer readers are found then this reader is not defined in the system and hence return. 
    if(peerReaders==null) {
      log.info("No peer readers found. Returning.");
      res.send(200);
    }

    
    //create a list of targets and their corresponding readers T1-> R1, R2
    for (var i = 0; i< peerReaders.length; i++) {
      var tl = targetRepo[peerReaders[i].macId];
      if(tl!=null){
        for (var j=0; j< tl.length; j++) {
          if(targetPos[tl[j]]==null) {
            targetPos[tl[j]]=[];
          }
          targetPos[tl[j]].push(peerReaders[i]);
        }
      }
    }

    log.info("Value of target Pos: "+ JSON.stringify(targetPos));

    //calculate the centroids for all targets in targetPos and create a list of unique centroids
    var centroidList = {};
    for(var k in targetPos) {
      var rList = targetPos[k];
      log.info('ReaderList for which target('+k+') is in range: '+JSON.stringify(rList));
      var minX = rList[0].x;
      var maxX = rList[0].x;
      var minY = rList[0].y;
      var maxY = rList[0].y;
      var minXCoord, maxXCoord, minYCoord, maxYCoord;
      if(rList.length==1) {
        var nt = k;
        if(centroidList[rList[0].x+", "+rList[0].y]!=null) {
          var ot = centroidList[minX+", "+minY].target;
          if(ot==null) {
            ot="";
          } 
          nt = ot+", "+k;
        } 
        centroidList[minX+", "+minY] = {target: nt, center: {x: rList[0].x+"px", y: rList[0].y+"px"}};
      } else {
        for (var m=0; m<rList.length; m++) {
          if(rList[m].x<minX) {
            minX = rList[m].x;
            minXCoord = rList[m];
          }
          if(rList[m].x>maxX) {
            maxX = rList[m].x;
            maxXCoord = rList[m];
          }
          if(rList[m].y<minY) {
            minY = rList[m].y;
            minYCoord = rList[m];
          }
          if(rList[m].y>maxY) {
            maxY = rList[m].y;
            maxYCoord = rList[m];
          }
        }
        
        var center = {};
        center.x = Math.round((maxX+minX)/2);
        center.y = Math.round((maxY+minY)/2);

        var nt = k;
        if(centroidList[center.x+", "+center.y]!=null) {
          //if location already exists, then append the name.
          var ot = centroidList[center.x+", "+center.y].target;
          if(ot==null) {
            ot="";
          } 
          nt = ot+", "+k;
        } 
        centroidList[center.x+", "+center.y] = {target: nt, center: {x: center.x+"px", y: center.y+"px"}};
        
      }
    }
    log.info('Centroid List: '+ JSON.stringify(centroidList));
    //log.info('posting data using datapost: '+ JSON.stringify(req.body));
    sock.emit('dataupdate', {posArr: centroidList});
    res.send(200);
  });


  app.get('*', function(req, res){
    res.render('index');
  });  

};