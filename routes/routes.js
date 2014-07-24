module.exports = function(app, models, log, io){
  var pasSock;
  io
    .of('/pas')
    .on('connection', function (socket) {
    //socket.emit('news', { hello: 'world' });
    pasSock = socket;
  });

  var appSock;
  io
    .of('/app')
    .on('connection', function (socket) {
    //socket.emit('news', { hello: 'world' });
    log.info('An app just connected to the server');
    appSock = socket;
  });


  app.get('/', function(req, res){
  	res.render('index');
  });


  /*
  * This service will be used to render the page used to send the alert.
  */
  app.get('/partials/:name', function(req, res){
    res.render('partials/'+req.params.name);
  });


  /*
  * This service will be used to push the alert to gcm.
  */
  app.post('/sendalert', function(req, res){
    log.info('called send alert with input: ' + JSON.stringify(req.body));
    var coords = req.body.literalCoords;
    var msg = req.body.message;
    var alertId = null;

    var alert = new models.alert();
    alert.msg = msg;
    alert.alertArea = coords;
    alert.save(function(err, a){
      if(err){
        throw err;
      } else {
        alertId = a._id;
        log.info('Alert saved in db as: ' + JSON.stringify(a));


        
        //Sending to GCM
        models.regid.find({deviceType: 'A'}, function(err, regids) {
          //call GCM service here.
          var gcm = require('node-gcm');
          var message = new gcm.Message({
            collapseKey: 'alert',
            delayWhileIdle: true,
            timeToLive: 3,
            data: {
              alertId: alertId,
              coords: coords
            }
          });

          //TO DO: Find a better way to convert json to array.
          //Convert json to array
          log.info("json of regids from mongo: "+ JSON.stringify(regids));
          var registrationIds = [];

          for (var i=0; i< regids.length; i++) {
            registrationIds.push(regids[i].rid);
          }

          log.info('array of reg ids sent to gcm: '+ registrationIds);
          var sender = new gcm.Sender('AIzaSyBsbzGhxMV5F6DdlMHOH-DGkpo9A6JZQaw');
          
          sender.send(message, registrationIds, 4, function (err, result) {
            console.log(result);
          });
        });


        //Sending to APNS Comes here.




        //Sending to test app
        appSock.emit('alert', {alertId: alertId, coords: coords});
        res.send({id: alertId, coords: coords});
      }
    })
  });

  
  /*
  * This service will be used to store the registration id
  */
  app.post('/registerid', function(req, res){
    log.info("recieved reg id: "+ JSON.stringify(req.body));
    models.regid.findOne({rid: req.body.regId}, function(err, regid) {
      //log.info('regid found: ' + regid);
      if(regid) {
        log.info("entry already exists for : " + req.body.regId);
      } else {
        var reg = new models.regid({rid: req.body.regId, 
          deviceType: req.body.deviceType});
        reg.save(function(err, r) {
          log.info("saved reg id: " + JSON.stringify(r));
        });
      }
    })
    res.send(200);
  });

  /*
  * This service will be used to send alert to the mobile app.
  */
  app.post('/irecieve', function(req, res){
    var alertId = req.body.alertId;

    log.info('irecieve called with data: ' +JSON.stringify(req.body));


    models.alert.findOne({_id: alertId}, function(err, a) {
      if(err) {
        throw err;
      } else if(!a) {
        log.info('No alert found for this id: ' + alertId);
        res.send(500);
      } else {
        //send the message
        a.count++;
        a.save();
        log.info('Alert message was sent to a requesting app: AlertId: '+ alertId);
        res.send({msg: a.msg});
      }
    });
  });

  app.get('/getalertdetails/:id', function(req, res){
    var id = req.params.id;
    models.alert.findOne({_id: id}, function(err, a) {
      if(err) {
        throw err;
      } else if(!a){
        log.info('No alert found for this id: ' + id);
        res.send(500);
      } else {
        res.send({message: a.msg, count: a.count, alertArea: a.alertArea});
      }
    })
  });

  app.get('/getallalerts', function(req, res){

    models.alert.find({}, function(err, a) {
      if(err) {
        throw err;
      } else if(!a) {
        log.info('No alerts found!');
        res.send(500);
      } else {
        res.send({alerts: a});
      }
    })
  });


  app.get('*', function(req, res){
    res.render('index');
  });  

};