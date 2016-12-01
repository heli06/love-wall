var verification = '';
var newUser = new Object();
var nodemailer = require("nodemailer");
var crypto = require('crypto'),
    User = require('../models/user.js'),
    Post = require('../models/post.js');
/* GET home page. */

exports.test = function(req, res) {
  Post.get(null, function(err, posts) {
    if (err) {
      posts = []
    }
    res.render('test', {
      title: '测试',
      posts: posts
    });
  });
};

exports.index = function(req, res) {
  Post.get(null, function(err, posts) {
    if (err) {
      posts = []
    }
    res.render('index', {
      title: '首页',
      posts: posts
    });

  });
};

exports.user = function(req, res) {
  User.get(req.params.user, function(err, user) {
    if (!user) {
      req.flash('error', '用户不存在');
      return res.redirect('/');
    }
    Post.get(user.name, function(err, posts) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('user', {
        title: user.name,
        posts: posts
      });
    });
  });
};

exports.post = function(req, res) {
  var currentUser = req.session.user;
  var post = new Post(currentUser.name,
      "To:#" + req.body.lovername + '#' + req.body.post + "#From:#" + req.body.yourname);
  post.save(function(err) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    req.flash('success', '发表成功');
    res.redirect('/u/' + currentUser.name);
  });
};

exports.reg = function(req, res) {
  res.render('reg', {
    title: '用户注册'
  });
};

exports.email = function(req, res) {
  res.render('email', {
    title: '验证码核对'
  });
};

exports.checkEmail = function(req, res) {

  if (verification != req.body['code']) {
    req.flash('error', '验证码不正确');
    return res.redirect('/reg');
  }

  //如果不存在则新增用户
  newUser.save(function(err) {
    if (err) {
      req.flash('error', err);
      verification = '';
      delete newUser.username;
      delete newUser.password;
      delete newUser.email;
      return res.redirect('/reg');

    }
    verification = '';
    req.session.user = newUser;
    req.flash('success', '注册成功');
    //alert("注册成功！");
    delete newUser.username;
    delete newUser.password;
    delete newUser.email;
    delete newUser.friends;
    res.redirect('/');
  });
};

exports.doReg = function(req, res) {

  //检验用户两次输入的口令是否一致
  if (req.body['password-repeat'] != req.body['password']) {
    req.flash('error', '两次输入的口令不一致');
    return res.redirect('/reg');
  }

  //生成口令的散列值
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('base64');

  newUser = new User({
    name: req.body.username,
    password: password,
    email: req.body['email'],
    friends:[]
  });


  //检查邮箱是否已被使用
  User.getEmail(newUser.email, function(err, user) {
    if (user)
      err = '邮箱已被使用';
    if (err) {
      req.flash('error', err);
      return res.redirect('/reg');
    }
    else{

      //检查用户名是否已经存在
      User.get(newUser.name, function(err, user) {
        if (user)
          err = '用户名已被使用';
        if (err) {
          req.flash('error', err);
          return res.redirect('/reg');
        } else {

          //随机生成验证码
          var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; //默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
          var maxPos = $chars.length;
          verification = '';
          for (i = 0; i < 4; i++) {
            verification += $chars.charAt(Math.floor(Math.random() * maxPos));
          }

          // 开启一个 SMTP 连接池
          var smtpTransport = nodemailer.createTransport("SMTP",{
            host: "smtp.qq.com", // 主机
            secureConnection: false, // 使用 SSL
            port: 25, // SMTP 端口
            auth: {
              user: "", // 请填写你自己的邮箱账号
              pass: "" // 请开启你邮箱的SMTP服务
            }
          });
          console.log(verification);
          // 设置邮件内容
          var mailOptions = {
            from: "鸑鷟的博客网站 <1125605844@qq.com>", // 发件地址
            to: req.body['email'], // 收件列表
            subject: verification, // 标题
            test:verification // 内容
          };
          // 发送邮件

          smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
              console.log(error);
            }else{
              console.log("Message sent: " + response.message);
            }
            //smtpTransport.close(); // 如果没用，关闭连接池
          });

          return res.redirect('/email');
        }
      });


    }
  });
};

exports.login = function(req, res) {
  res.render('login', {
    title: '用户登入'
  });
};

exports.doLogin = function(req, res) {
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('base64');

  User.get(req.body.username, function(err, user) {
    if (!user) {
      req.flash('error', '用户不存在');
      return res.redirect('/login');
    }
    if (user.password != password) {
      req.flash('error', '用户口令错误');
      return res.redirect('/login');
    }
    req.session.user = user;
    req.flash('success', '登入成功');
    res.redirect('/');
  });
};

exports.addFriends = function(req, res) {
  User.addFriends(req.params.user, req.body['friendname'],function(err, newfriends) {
    if (err) {
      console.log(err);
      req.flash('error', err);
      return res.redirect('/');
    }
    res.render('manage', {
      title: req.params.user + '管理',
      friends:newfriends
    });
  });
};

exports.manage = function (req,res) {
  User.getFriends(req.params.user, function(err, friends) {
    if (err) {
      console.log(err);
      req.flash('error', err);
      return res.redirect('/');
    }
    res.render('manage', {
      title: req.params.user + '管理',
      friends:friends
    });
  });
 };

exports.logout = function(req, res) {
  req.session.user = null;
  req.flash('success', '登出成功');
  res.redirect('/');
};

