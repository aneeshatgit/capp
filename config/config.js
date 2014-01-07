module.exports = function(app, express){

  var config = this;
  var flash = require('connect-flash');

  //generic config
  app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', './views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'topsecret' , cookie: {maxAge: 600000}}));
    app.use(function(req, res, next) {
        res.locals.loggedIn = req.session.loggedIn;
        res.locals.priPhone = req.session.priPhone;
        next();
    });    
    app.use(flash());
    app.use(express.methodOverride());
    app.use(express.static('./public'));
    app.use(app.router);
  });

  //env specific config
  app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.mongoose.connect('mongodb://localhost/cdmdb');
  });

  app.configure('production', function(){
    app.use(express.errorHandler());
    app.mongoose.connect('mongodb://localhost/cdmdb');
  });

  return config;
};