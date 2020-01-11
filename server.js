var express = require("express");
var app = express();
var router = express.Router();
var request = require('request');
var bodyParser = require('body-parser');


var config = {
  appid: "wx464825d8e60bd635",
  secret: "60bcc374ef2792277a2ef2b003b1d602",
  grant_type: "authorization_code",

  openid: "",
  access_token: "",

}

app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', express.static(__dirname + '/mp'))
app.use('/', express.static(__dirname + '/web'))

// test api
app.get('/api/gettest',function(req,res){
  res.send("helllp  adas")
})
app.post('/api/posttest',function(req,res){
  console.log(req.body)
  res.send(req.body)
})

// 3.1转发请求 网页授权access_token
// params -- code
app.post('/api/getWebAccessToken', function (req, res, next) {
  var code = req.body.code
  var access_token_url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${config.appid}&secret=${config.secret}&code=${code}&grant_type=${config.grant_type}`
  // console.log(req.body)
  
  request(access_token_url, function (error, response, body) {
      if (!error && response.statusCode === 200) {
          var data = JSON.parse(body);
          res.send(data);
      } else {
        res.send('{error:404,data:' + error+'}');
      }
  });
});

// 3.2刷新access_token（如果需要）
// params -- refresh_token
app.post('/api/getRefreshToken',function(req,res,next){
  var refresh_token = req.body.refresh_token
  var refresh_token_url = `https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=${config.appid}&grant_type=refresh_token&refresh_token=${refresh_token}`

  request(refresh_token_url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var data = JSON.parse(body);
      res.send(data);
    } else {
      res.send('{error:404,data:' + error + '}');
    }
  });
})

// 4.拉取用户信息(需scope为 snsapi_userinfo)
app.post('/api/getUserInformation',function(req,res,next){
  var { access_token, openid, lang} = req.body
  var user_information_url = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=${lang}`
 
  request(user_information_url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var data = JSON.parse(body);
      res.send(data);
    } else {
      res.send('{error:404,data:' + error + '}');
    }
  });
})

// 5.检验授权凭证（access_token）是否有效
app.post('/api/isAccessTokenTrue', function (req, res, next) {
  var { access_token, openid } = req.body
  var is_access_token_url = `https://api.weixin.qq.com/sns/auth?access_token=${access_token}&openid=${openid}`
  
  request(is_access_token_url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var data = JSON.parse(body);
      res.send(data);
    } else {
      res.send('{error:404,data:' + error + '}');
    }
  });
})

app.listen(8901)