var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var routes = require('./routes/index');
//var users = require('./routes/users');
var user = require('./models/user');
var connect = require('connect');
var session = require('express-session');
var flash = require('connect-flash');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.get('/', routes.index);
//app.get('/u/:user', routes.user);
//app.post('/post', routes.post);
//app.get('/reg', routes.reg);
//app.post('/reg', routes.doReg);
//app.get('/login', routes.login);
//app.post('/login', routes.doLogin);
//app.get('/logout', routes.logout);

var settings = require('./settings');
var MongoStore = require('connect-mongo')(session);

//if ('development' == app.get('env')) {

  app.use(methodOverride());

  app.use(session({
    secret: settings.cookieSecret,
    store: new MongoStore({
      url: 'mongodb://localhost/settings'
    })
  }));

  app.use(express.static(__dirname + '/public'));
//}

app.use(flash());

//动态视图助手
app.use(function(req, res, next){
  console.log("app.usr local");
  res.locals.user = req.session.user;
  res.locals.post = req.session.post;
  var error = req.flash('error');
  res.locals.error = error.length ? error : null;

  var success = req.flash('success');
  res.locals.success = success.length ? success : null;
  next();
});

function checkLogin(req, res, next) {
  console.log(req.session.user);
  if (!req.session.user) {
    req.flash('error', '未登入');
    return res.redirect('/login');
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.flash('error', '已登入');
    return res.redirect('/');
  }
  next();
}

function checkRightUser(req, res, next) {
  if (req.params.user != req.session.user.name){
    console.log('req.params.user:' + req.params.user);
    console.log('req.session.user:' + req.session.user.name);
    req.flash('error', '你没有权限');
    return res.redirect('/');
  }
  next();
}

//访问首页
app.get('/', routes.index);

//访问用户的发言合集
app.get('/u/:user',checkRightUser);
app.get('/u/:user', routes.user);

//用户的私人管理面板
app.get('/u/:user/manage',checkRightUser);
app.get('/u/:user/manage',routes.manage);

//添加或删除关注
app.post('/u/:user/manage',checkRightUser);
app.post('/u/:user/manage',routes.addFriends);

//发微博
app.post('/post', checkLogin);
app.post('/post', routes.post);

//email验证码核对
app.get('/email', checkNotLogin);
app.get('/email', routes.email);

//提交Email验证码
app.post('/email', checkNotLogin);
app.post('/email', routes.checkEmail);

//访问注册页面
app.get('/reg', checkNotLogin);
app.get('/reg', routes.reg);

//发送注册信息表单
app.post('/reg', checkNotLogin);
app.post('/reg', routes.doReg);

//访问登录页面
app.get('/login', checkNotLogin);
app.get('/login', routes.login);

//发送登录信息表单
app.post('/login', checkNotLogin);
app.post('/login', routes.doLogin);

//退出账户
app.get('/logout', checkLogin);
app.get('/logout', routes.logout);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
