var express = require("express");
var app = express();
var router = express.Router();
var request = require('request');
var bodyParser = require('body-parser');


var config = {
  appid: "",
  secret: "",
  grant_type: "authorization_code",

  openid: "",
  access_token: "",

}

app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', express.static(__dirname + '/mp'))
app.use('/', express.static(__dirname + '/web'))

// require('./routes/jssdk')(app)
// require("./routes/code")(app)
require("./routes/test.js")(app)

/** ========================= 微信jssdk接口 start ==========================*/
var JSSDK_VAR = {
  gogalAccessToken: {},
  jsapiTicket:{}
}
// access_token是公众号的全局唯一接口调用凭据
app.get("/api/getGogalAccessToken",function(req,res){
  // 文档 https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html
 
  var grant_type = "client_credential"
  var appid = config.appid
  var secret = config.secret
  var url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=${grant_type}&appid=${appid}&secret=${secret}`
  
  request(url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var data = JSON.parse(body);
      JSSDK_VAR.gogalAccessToken = data
      res.send(data);
    } else {
      res.send('{error:404,data:' + error + '}');
    }
  });
  
})


app.post("/api/getJsapiTicket",function(req,res){
 
  var access_token = req.body.access_token
  var url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${access_token}&type=jsapi`  
 
  request(url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var data = JSON.parse(body);
      JSSDK_VAR.jsapiTicket = data
      res.send(data);
    } else {
      res.send('{error:404,data:' + error + '}');
    }
  });
})


// 获取 openid 与3.1的请求方式一样
app.get('/api/getopenid', function (req, res) {
  const code = req.query.code;
  const access_token_url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${config.appid}&secret=${config.secret}&code=${code}&grant_type=authorization_code`;

  request.post({ url: access_token_url }, function (error, response, body) {
    wFile('openid', body);
    if (error) {
      res.json({ error: body });
    } else if (response.statusCode === 200) {
      if (body.errcode === 40029) {
        res.json({ error: body });
      } else {
        body = JSON.parse(body);
        res.json({ data: body });
      }
    } else {
      res.json({ error: -1 });
    }
  });
});


/** ======================== 微信jssdk接口 end =================================*/


/** ======================== 微信网页接口授权 start===============================*/

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

/** ======================== 微信网页接口授权 end ===============================*/

app.listen(8901)
