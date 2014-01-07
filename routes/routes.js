module.exports = function(app, models){

  app.get('/', function(req, res){
  	res.render('index');
  });

  app.get('/partials/login', function(req, res){
    res.render('partials/login');
  });


  app.post('/generateOtp', function(req, res){
    //generate an otp and print on console.
    var otp = Math.floor(Math.random()*90000) + 10000;
    var now = new Date();
    var time = now.getDate()+"-"+(now.getMonth()+1)+"-"+now.getFullYear()+", "+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
    
    //check if the db has an existing login attempt. If yes, update it, else create a new one.
    models.login.findOne({priPhone: req.body.priPhone}, function(err, login){
      if(err) {
        throw err;
      } else if (!login) {
        login = new models.login({priPhone: req.body.priPhone, otp: otp, createdAt: time});
      } else {
        login.otp = otp;
        login.createdAt = time;
      }
      login.save(function(err, login){
        if(err) {
          throw err;
        }
        req.session.priPhone = req.body.priPhone;
        console.log("login: "+login);
        res.send({status: 'ok'});
      });
    });
  });

  app.get('/partials/otp', function(req, res){
    res.render('partials/otp');
  });

  app.post('/validateOtp', function(req, res){
    models.login.findOne({priPhone: req.body.priPhone}, function(err, login){
      if(err){
        throw err;
      }
      if(login.validateOtp(req.body.otp)) {
        req.session.loggedIn = true;
        req.session.priPhone = req.body.priPhone;
        console.log('validated ok');
        res.send({validated: true});
      } else {
        console.log('validated NOT ok');
        res.send({validated: false});
      }
    });
  });

  app.get('/partials/address', function(req, res){
    //check if user is logged in
    if(req.session.loggedIn) {
      console.log("req.session: "+ req.session);
      console.log("req.session.loggedIn: "+ req.session.loggedIn);
      res.render('partials/address', {loggedIn: true, priPhone: req.session.priPhone});
    } else {
      res.send('unauthorized');
    }
  });

  app.get('/logoff', function(req, res){
    //check if user is logged in
    console.log("logoff route is called");
    req.session.loggedIn = false;
    req.session.priPhone = null;
    console.log("session nulled");
    res.send({status: 'ok'});
  });


  app.post('/updateAddress', function(req, res){
    if(req.session.loggedIn) {
      //update address
      models.address.findOne({priPhone: req.body.priPhone}, function(err, address){
        if(err) {
          throw err;
        } else if (!address) {
          console.log('address not found');
          address = new models.address({priPhone: req.body.priPhone, 
                                        addressData: [{
                                          nrn: req.body.nrn,
                                          name: req.body.name,
                                          addressLn1: req.body.addressLn1,
                                          addressLn2: req.body.addressLn2,
                                          zipCode: req.body.zipCode,
                                          fixedPhone1: req.body.fixedPhone1,
                                          fixedPhone2: req.body.fixedPhone2,
                                          mobilePhone1: req.body.mobilePhone1,
                                          mobilePhone2: req.body.mobilePhone2,
                                          x: req.body.x,
                                          y: req.body.y
                                        }]});
        } else {
          console.log('address not found');
          address.addressData = [{nrn: req.body.nrn,
                                    name: req.body.name,
                                    addressLn1: req.body.addressLn1,
                                    addressLn2: req.body.addressLn2,
                                    zipCode: req.body.zipCode,
                                    fixedPhone1: req.body.fixedPhone1,
                                    fixedPhone2: req.body.fixedPhone2,
                                    mobilePhone1: req.body.mobilePhone1,
                                    mobilePhone2: req.body.mobilePhone2,
                                    x: req.body.x,
                                    y: req.body.y
                                  }];
        }
        address.save(function(err, address){
          if(err) {
            throw err;
          }
          res.send({status: 'ok'});
        });
      });
    } else {
      res.render('partials/login');
    }
  });

  
  app.get('/getAddress/:priPhone', function(req, res) {
    console.log('getaddress called');
    if(req.session.loggedIn) {
      console.log('user logged in for get address');
      //get address
      models.address.findOne({priPhone: req.params.priPhone}, function(err, address){
        if(err) {
          throw err;
        } else if (!address) {
          console.log('req.priPhone->'+req.params.priPhone);
          res.send({address: {priPhone: req.params.priPhone, 
                                        nrn: "",
                                        name: "",
                                        addressLn1: "",
                                        addressLn2: "",
                                        zipCode: "",
                                        fixedPhone1: "",
                                        fixedPhone2: "",
                                        mobilePhone1: "",
                                        mobilePhone2: "",
                                        x: "",
                                        y: ""
                                      }});
          console.log('address data: '+ address);
        } else {
          console.log('address data: '+ address);
          res.send({address: {
                                    priPhone: address.priPhone,
                                    nrn: address.addressData[0].nrn,
                                    name: address.addressData[0].name,
                                    addressLn1: address.addressData[0].addressLn1,
                                    addressLn2: address.addressData[0].addressLn2,
                                    zipCode: address.addressData[0].zipCode,
                                    fixedPhone1: address.addressData[0].fixedPhone1,
                                    fixedPhone2: address.addressData[0].fixedPhone2,
                                    mobilePhone1: address.addressData[0].mobilePhone1,
                                    mobilePhone2: address.addressData[0].mobilePhone2,
                                    x: address.addressData[0].x,
                                    y: address.addressData[0].y
                                  }});
        }
      });
    } else {
      res.send({validated: false});
    }
  }); 


  app.get('*', function(req, res){
    res.render('index');
  });  

};