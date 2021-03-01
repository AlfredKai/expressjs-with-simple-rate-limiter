const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const rateLimiter = require('./middleware/rate-limiter/rateLimiter');
const RequestCounter = require('./middleware/rate-limiter/requestCounter');

const indexRouter = require('./routes/index');
const testRouter = require('./routes/test');

const app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const except = function(path, middleware) {
  return function(req, res, next) {
    if (req.url.search(path) !== -1) {
          return next();
      } else {
          return middleware(req, res, next);
      }
  };
};

// apply rate-limiting to all routes except routes for end-to-end testing
app.use(except(/\/test\/*/, rateLimiter(60, new RequestCounter(60))));

app.use('/', indexRouter);
// end-to-end testing routes which should not be exposed
app.use('/test', testRouter);

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
  res.send('error');
});

module.exports = app;
