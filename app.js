var https = require('https');
var fs = require('fs');
const redirectToHttps = require('https-rewrite/express');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var passport = require('passport');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var reportRouter = require('./routes/report');
// Load env variables
require('dotenv').config();

// HTTPS options
var httpsOptions = {
  pfx: fs.readFileSync(process.env.CERT_PATH),
  passphrase: process.env.CERT_PASSPHRASE
};

var app = express();

// app.use(redirectToHttps({ status: 301 }));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(validator());
// MySQL options
var options = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DBNAME
};
var sessionStore = new MySQLStore(options);
// session options
app.use(session({
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  saveUninitialized: false,
  resave: true,
  rolling: true,
  cookie: { secure: false, maxAge: 600000 }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, '/public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

app.use(function (req, res, next) {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

// app.use('*', function (req, res, next) {
//   if (!req.secure && process.env.NODE_ENV == 'production') {
//     var secureUrl = "https://mydesktopmhs.amidata.com.au:3001" + req.url;
//     res.writeHead(301, { "Location": secureUrl });
//     res.end();
//   }
//   next();
// });

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/report', reportRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get(process.env.NODE_ENV) === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');

});

https.createServer(httpsOptions, app).listen(443);

module.exports = app;
