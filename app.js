
var express = require('express');
var app = module.exports = express();
app.mongoose = require('mongoose');
var http = require('http');

var config = require('./config/config')(app, express);


var models = require('./models/models')(app.mongoose);

require('./routes/routes')(app, models);

var server = http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});