var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var calendar = require('./routes/calendar');
var session = require('express-session');

var app = express();

app.use(session({
    secret : 'my-special-secret', // 필수 항목 (서명 위해서 사용합니다)
    resave : false,  // 권장 사항 (세션 내용에 변경이없는 경우에도 저장하는 경우는 true)
    saveUninitialized : true, // 권장 사항 (새로운 세션을 생성하고 아무것도 대입되어 있지 않아도 값을 넣는 경우는 true)
    rolling : true, // 액세스마다 유효 기간을 늘릴 경우에는 true
    name : 'KI',  // 쿠기 이름
    cookie            : { // { path: '/', httpOnly: true, secure: false, maxAge: null }」
        maxAge : 1000 * 60 * 60 * 24, // 1 day
    }
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/calendar', calendar);

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
