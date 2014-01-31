module.exports = function(app, models, recaptcha){
  var RECAPTCHA_BY_PASS = false;
  app.get('/', function(req, res){
  	res.render('index');
  });

  app.get('/partials/login', function(req, res){

    res.render('partials/login', {public_key: recaptcha.public_key});
  });


  app.post('/generateOtp', function(req, res){
    //generate an otp and print on console.
    var otp = Math.floor(Math.random()*90000) + 10000;
    var now = new Date();
    var time = now.getDate()+"-"+(now.getMonth()+1)+"-"+now.getFullYear()+", "+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
    

    //check Captcha
    var data = {
        remoteip:  req.connection.remoteAddress,
        challenge: req.body.recaptcha_challenge_field,
        response:  req.body.recaptcha_response_field
    };
    recaptcha.data = data;

    function convertNumberToString(num, len) {
      var numStr="";
      for(var i = 0; i< len; i++){
        numStr=numStr+ num.charAt(i);
        if(i!=len-1) {
          numStr=numStr+ ", ";
        }
      }
      return numStr;
    }

    function generateOtp(){

      //check if the db has an existing login attempt. If yes, update it, else create a new one.
      models.login.findOne({priPhone: req.body.priPhone}, function(err, login){
        console.log('login: ' + login);
        if(err) {
          throw err;
        } else if (!login) {
          console.log('this is a new login: '+ login);
          login = new models.login({priPhone: req.body.priPhone, otp: otp, createdAt: time});
        } else {
          login.otp = otp;
          login.createdAt = time;
        }
        login.save(function(err, login){
          if(err) {
            throw err;
          }
          req.session.priPhone = ""+req.body.priPhone;
          console.log("req.session.priPhone: "+req.session.priPhone);
          console.log("login: "+login);
          if(req.body.method=="voice"){
            require('./delivery.js').voice(req.body.priPhone,'Hello, This is a message from Population Alert Database System. Your CDM password is: '+convertNumberToString(""+login.otp, 5)+'. Your CDM password is: '+convertNumberToString(""+login.otp, 5));  
          } else {
            require('./delivery.js').smser(req.body.priPhone,'Your CDM password is: '+ login.otp);
          }
          
          res.send({status: true});
        });
      });      
    }
    if(!RECAPTCHA_BY_PASS){
      recaptcha.verify(function(success, error_code) {
        if (success) {
          generateOtp();
        } else {
          console.log('Recaptcha response invalid.');
          // Redisplay the form.
          res.send({status: false});
        }
      }); 
    } else {
      generateOtp();
    }   
  });

  app.get('/partials/otp', function(req, res){
    console.log('req.session.priPhone otp: '+ req.session.priPhone);
    if(req.session.priPhone!=null) {
      res.render('partials/otp');
    } else {
      res.render('partials/unauthorized', {unauth: 'unauth'});
    }
  });

  app.post('/validateOtp', function(req, res){
    if(req.session.priPhone!=null){
      models.login.findOne({priPhone: req.body.priPhone}, function(err, login){
        if(err){
          throw err;
        }
        console.log('otp: '+ req.body.otp);
        if(login.validateOtp(req.body.otp)) {
          req.session.loggedIn = true;
          req.session.priPhone = req.body.priPhone;
          res.send({validated: true});
        } else {
          res.send({validated: false});
        }
      });      
    } else {
      res.send({validated: false});
    }

  });

  app.get('/partials/address', function(req, res){
    //check if user is logged in
    if(req.session.loggedIn) {
      res.render('partials/address');
    } else {
      res.render('partials/unauthorized', {unauth: 'unauth'});
    }
  });

  app.get('/logoff', function(req, res){
    //check if user is logged in
    req.session.loggedIn = false;
    req.session.priPhone = null;
    res.send({status: 'ok'});
  });


  app.post('/updateAddress', function(req, res){
    if(req.session.loggedIn) {
      //update address
      models.address.findOne({priPhone: req.body.priPhone}, function(err, address){
        if(err) {
          throw err;
        } else if (!address) {
          address = new models.address({priPhone: req.body.priPhone});
        } 
        address.nrn = req.body.nrn;
        address.name = req.body.name;
        address.addressData = req.body.addressData;
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
    if(req.session.loggedIn) {
      //get address
      models.address.findOne({priPhone: req.params.priPhone}, function(err, address){
        if(err) {
          throw err;
        } else if (!address) {
          res.send({address: {priPhone: req.params.priPhone,
                                        addressData: []}
                                      });
        } else {
          res.send({address: {
                                    priPhone: address.priPhone,
                                    pendingPriPhone: address.pendingPriPhone,
                                    nrn: address.nrn,
                                    name: address.name,
                                    addressData: address.addressData
                                  }});
        }
      });
    } else {
      res.send({validated: false});
    }
  });

  app.post('/addNewAddress', function(req, res){
    if(req.session.loggedIn) {
      var id;
      models.address.findOne({priPhone: req.session.priPhone}, function(err, address){
        if(err) {
          throw err;
        } else if (!address) {
          //TODO: Handle the case where no address is found.
          address = new models.address();
          address.priPhone = req.session.priPhone;
          address.addressData.push({addressName: req.body.addressName});
          id = address.addressData[address.addressData.length-1]._id
        } else {
          address.addressData.push({addressName: req.body.addressName});
          id = address.addressData[address.addressData.length-1]._id
        }
        address.save(function(err, address){
          if(err) {
            throw err;
          }
          res.send({status: 'ok', id: id, addressData: address.addressData});
        });
      });
    }
  });

  app.post('/deleteAddress', function(req, res) {
    if(req.session.loggedIn) {
      models.address.findOne({priPhone: req.session.priPhone}, function(err, address){
        if(err) {
          throw err;
        } else if (!address) {
          //TODO: Handle the case where no address is found.
          res.send({status: 'ok'});
        } else {
          address.addressData.id(req.body.id).remove();
        }
        address.save(function(err, address){
          if(err) {
            throw err;
          }
          res.send({status: 'ok'});
        });
      });
    }
  });

  //change phone number
  app.post('/updatePhoneNumber', function(req, res){
    if(req.session.loggedIn) {
      //update address
      models.address.findOne({priPhone: req.session.priPhone}, function(err, address){
        if(err) {
          throw err;
        } else if (!address) {
          //TODO: Handle the case where no address is found.
        } else {
          if(req.body.phoneKey == 'pendingPriPhone') {
            //check if this number belongs to somebody else.
            models.address.findOne({priPhone: req.body.newNumber}, function(err, ea){
              if(err) {
                throw err;
              } else if(!ea){
                address.pendingPriPhone = req.body.newNumber;    
                address.save(function(err, address){
                  if(err) {
                    throw err;
                  }
                  res.send({status: true});
                });
              } else {
                res.send({status: false});
              }
            });
          } else {
            //update the pending phone number field with the new number. 
            address.addressData.id(req.body.id)[req.body.phoneKey] = req.body.newNumber;
            address.save(function(err, address){
              if(err) {
                throw err;
              }
              res.send({status: true});
            });
          }
        }
      });
    } else {
      res.render('partials/unauthorized');
    }
  });



  //send otp
  app.post('/sendModifyOtp', function(req, res){
    if(req.session.loggedIn) {
      //generate otp and current time
      var otp = Math.floor(Math.random()*90000) + 10000;
      var now = new Date();
      var time = now.getDate()+"-"+(now.getMonth()+1)+"-"+now.getFullYear()+", "+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();

      //TO DO: Remove this function and make it common for OTP and validation. 
      function convertNumberToString(num, len) {
        var numStr="";
        for(var i = 0; i< len; i++){
          numStr=numStr+ num.charAt(i);
          if(i!=len-1) {
            numStr=numStr+ ", ";
          }
        }
        console.log("numStr: "+ numStr);
        return numStr;
      }



      //add otp for the new number
      models.validation.findOne({phone: req.body.phoneNumber}, function(err, validation){
        if(err) {
          throw err;
        } else if (!validation) {
          //save the generated otp
          validation = new models.validation({phone: req.body.phoneNumber, otp: otp, createdAt: time});
        } else {
          validation.phone = req.body.phoneNumber;
          validation.otp = otp;
          validation.createdAt = time;
        }
        validation.save(function(err, validation){
          if(err) {
            throw err;
          }
          if(req.body.deliveryMethod=="voice"){
            require('./delivery.js').voice(req.body.phoneNumber,'Hello, This is a message from Population Alert Database System. Your validation code is: '+convertNumberToString(""+validation.otp, 5)+'. Your validation code is: '+convertNumberToString(""+validation.otp, 5));  
          } else {
            require('./delivery.js').smser(req.body.phoneNumber,'Your CDM password is: '+ validation.otp);
          }
          res.send({status: 'ok'});
        });
      });
    } else {
      res.render('partials/unauthorized');
    }
  });

  //validate otp for number change
  app.post('/numChangeValidation', function(req, res){
    if(req.session.loggedIn) {
      //check the user input otp against the previously generated otp. 
      models.validation.findOne({phone: req.body.phoneNumber}, function(err, validation){
        if(err) {
          throw err;
        } else if (!validation) {
          res.send({validated: false});
        } else {
          if(validation.validateOtp(req.body.otp)) {
            models.address.findOne({priPhone: req.session.priPhone}, function(err, address){
              if(err) {
                throw err;
              } else if(!address) {
                //TO DO: Handle the case where no address is found.
              } else {

                if(req.body.numberKey == 'pendingPriPhone') {
                  address.priPhone = address.pendingPriPhone;
                  address.pendingPriPhone = null;
                  req.session.priPhone = address.priPhone;
                } else {
                  var ad = address.addressData.id(req.body.id);
                  switch(req.body.numberKey) {
                    case 'pendingFixedPhone1':
                      ad.fixedPhone1 = ad.pendingFixedPhone1;
                      ad.pendingFixedPhone1 = null;
                      break;
                    case 'pendingFixedPhone2':
                      ad.fixedPhone2 = ad.pendingFixedPhone2;
                      ad.pendingFixedPhone2 = null;
                      break;
                    case 'pendingMobilePhone1':
                      ad.mobilePhone1 = ad.pendingMobilePhone1;
                      ad.pendingMobilePhone1 = null;
                      break;
                    case 'pendingMobilePhone2':
                      ad.mobilePhone2 = ad.pendingMobilePhone2;
                      ad.pendingMobilePhone2 = null;
                      break;
                  }
                }
                address.save(function(err, address){
                  if(err) {
                    throw err;
                  }
                });
                res.send({validated: true});
              }
            });
            
          } else {
            res.send({validated: false});
          }
        }
      });
    } else {
      res.render('partials/unauthorized');
    }
  });


  app.get('*', function(req, res){
    res.render('index');
  });  

};