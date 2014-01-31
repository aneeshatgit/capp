
var express = require('express');
var app = module.exports = express();
app.mongoose = require('mongoose');
var http = require('http');

var config = require('./config/config')(app, express);
var params = require('./config/config-params');

var models = require('./models/models')(app.mongoose);

var Recaptcha = require('recaptcha').Recaptcha;
var PUBLIC_KEY  = params.publicKey;
    PRIVATE_KEY = params.privateKey;
var recaptcha = new Recaptcha(PUBLIC_KEY, PRIVATE_KEY);
require('./routes/routes')(app, models, recaptcha);


var server = http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));

	//process.on('uncaughtException', function(err) {
//	  console.log('Caught exception: ' + err);
//	});
});