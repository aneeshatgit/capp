
var express = require('express');
var app = module.exports = express();
app.mongoose = require('mongoose');
var http = require('http');
var log = require('custom-logger').config({ level: 0 });
var server = http.createServer(app)
var io = require('socket.io').listen(server, {log: false});

var config = require('./config/config')(app, express);

var models = require('./models/models')(app.mongoose);

require('./routes/routes')(app, models, log, io);

server.listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
	//process.on('uncaughtException', function(err) {
	  //console.log('Caught exception: ' + err);
	//});
});