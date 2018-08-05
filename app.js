//i have used the following libraries
//bcryptjs library for encrypting passwords
//express-validator library for form validation
//mongoose library for mongo db database
//express-session library for sessions
//express-flash-messages library for displaying flash messages

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var flash = require('express-flash-messages');
var expressValidator = require('express-validator');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mongoose = require('mongoose');
var app = express();

//here connection with the mongodb database is made.
//this link is provided by the mongodb.
mongoose.connect('mongodb://ruwan:ruwan001@ds241530.mlab.com:41530/pm',function(err){

if(err){
	console.log(err);
}
else
{
	console.log('connected');
}
});


//models

var User = require('./models/users');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'projectmanagement'}));
app.use(flash());
app.use(expressValidator());
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
