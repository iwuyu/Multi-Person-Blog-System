var dbConfig = require('../../serve/dbConfig');
let Mail = require('../utils/mail');
// let Date = require('../utils/time');
const Jwt = require("../utils/jsonwebtoken");

let codes = {} // 通过内存保存验证码信息
let time = {} // 保存发送时长
let time2 = {} // 保存验证码存放时长
let timer2 = {}; // 保存验证码时长定时器

// 验证用户是否为登录状态
userIsLogined = (req,res) => {
  let {token} = req.body;
  Jwt
  .verifyToken(token) // 将前台传来的token进行解析
  .then(data => {
    if (data.token.username) {
      return res.json({ 
        statusCode: 0, 
        message: "欢迎小可爱回哦来！" 
      });
    } else {
      return res.json({ 
        statusCode: -999, 
        message: "您还没有登录,快去登录吧！" 
      });
    }
 }).catch(err => {
    return res.json({ 
      statusCode: 400, 
      message: "您登录时间过长,为了您的账号安全请重新登录吧！" 
    })
  })
}

// 用户退出
userExit = (req,res) => {
  req.session.destroy();
  res.json({ 
    statusCode: 0, 
    message: "拜拜，下次见！" 
  });
}

// 用户登录
userLogin = (req,res) => {
  const { username,password } = req.body;
  const sql = "SELECT * FROM user WHERE username = ? AND password = ?";
  let sqlArr = [username, password];
  let userLoginCallBack = (err,data) => {
    if(err) {
      res.send({ 
        statusCode: 900, 
        message: "出错了，请检查网络设备是否正常!" 
      });
    }else {
      if(data.length > 0){
        // 存在
        /* 登陆成功 我们直接就生成一个token给的用户传递过去 */
        const token = Jwt.createToken({ username: username, login: true });
        req.session.userlogin = true;
        let user = {};
        user.name = data[0].username;
        user.avatar = data[0].head_image;
        user.nick = data[0].nick_name;
        user.token = token;
        res.send({
          statusCode:200,
          message:`欢迎小可爱回来哦！`,
          data:user,
        });
      }else {
        res.send({
          statusCode:700,
          message:'太马虎了,用户名或密码都能搞错!'
        })
      }
    }
  }
  dbConfig.sqlConnect(sql,sqlArr,userLoginCallBack)
}
// 发送邮箱验证码
sendMail = (req,res) => {
  const { mail } = req.body;
  console.log(mail)
  const sql = "SELECT username FROM user WHERE email = ?";
  let sqlArr = [ mail ];
  let sendMailCallBack = (err,data) => {
    if(err) {
      res.send({ 
        statusCode: 900, 
        message: "出错了，请检查网络设备是否正常!" 
      });
    }else {
      if(data.length > 0){
        // 查询到该邮箱已被注册
        res.send({ 
          statusCode: 601,
          message: `该邮箱已被${data[0].username}用户注册!` 
        });
      }else {
        if(!time.hasOwnProperty(mail)){
          // 判断内存中没有该邮箱的限制时长
          let code = parseInt(Math.random()*10000) // 产生随机验证码
          Mail.send(mail,code).then(() => {
            codes[mail] = code; // 将邮箱和邮箱匹配的验证码保存到缓存中
            res.send({
              statusCode: 200,
              message:'验证码发送成功！请注意查收︿(￣︶￣)︿'
            });
            console.log('code',codes[mail]);
          }).catch(err => {
            res.send({
              statusCode:700,
              message:'验证码发送失败,请检查您的邮箱是否正确'
            })
          })
          // 开启定时器1,限制一分钟之内不能重复发送
          time[mail] = 0; // 保存该邮箱的限制时长
          let timer = setInterval(() => {
            time[mail]++;
            if(time[mail] > 60){ 
              // 超过限制时长 
              clearInterval(timer); // 关闭定时器1
              delete time[mail]; // 删除该邮箱的限制时长
            }
          },1000);
          // 初始化定时器2
          if(timer2[mail]) clearInterval(timer2[mail]);
          // 开启定时器2，限制验证码保存时间
          time2[mail] = 0;
          timer2[mail] = setInterval(() => {
            time2[mail]++;
            if(time2[mail] > 300){
              // 超过限定时间
              clearInterval(timer2[mail]); // 关闭定时器2
              delete codes[mail]; // 删除验证码
              delete time2[mail]; // 删除定时器2时长
            }
          },1000);
        }else {
          res.send({
            statusCode:600,
            message:`发送太频繁了，请${60 - time[mail]}秒后再试`
          })
        }
      }
    }
  }
  dbConfig.sqlConnect(sql,sqlArr,sendMailCallBack)
}

// 用户注册
userRegister = (req,res) => {
  const { username,password,mail,code } = req.body;
  console.log(username,password,mail,code)
  let sqlArr1 = [username];
  let sql1 = "SELECT username FROM user WHERE username = ?";
  let registedCallBack = (err,data) => {
    if(err){
      res.send({ 
        statusCode: 900, 
        message: "出错了，请检查网络设备是否正常!" 
      });
    }else{
      if(data.length > 0){
        res.send({ 
          statusCode: 601, 
          message: "该用户名已被注册!" 
        });
      }else {
        if(codes[mail]){
          if(codes[mail] == code){
            // let date = Date.getLocalTime('yyyy-MM-dd hh:mm:ss').toString();
            let date = new Date().getTime();
            const sql = "INSERT INTO user(username,password,email,register_time)VALUES(?,?,?,?)";
            let sqlArr = [username,password,mail,date];
            let registeCallBack = (err) => {
              if(err) {
                res.send({ 
                  statusCode: 900, 
                  message: "出错了，请检查网络设备是否正常!" 
                });
              }else {
                // 注册成功
                delete codes[mail]; // 删除验证码
                res.send({ 
                  statusCode: 200, 
                  message: "恭喜你注册成功!，快去登录吧！" 
                });
              }
            }
            dbConfig.sqlConnect(sql,sqlArr,registeCallBack);
          }else {
            res.send({ 
              statusCode: 400, 
              message: "你的验证码不正确！" 
            });
          }
        }else {
          res.send({ 
            statusCode: 400, 
            message: "你还没有发送验证码!" 
          });
        }
      }
    }
  }
  dbConfig.sqlConnect(sql1,sqlArr1,registedCallBack);
}

// 更改头像
// updateAvatar = (req,res) => {
//   let {token,avatar} = req.body;
//   Jwt
//   .verifyToken(token) // 将前台传来的token进行解析
//   .then(data => {
//     const sql = "UPDATE user SET head_image = ? WHERE username = ?";
//     let sqlArr = [avatar,data.token.username];
//     let updateAvatarCallBack = err => {
//       if(!err) {
//         return res.json({ err: 0, msg: "修改成功", data:true });
//       }else {
//         res.send({ err: -999, msg: "出错了，请检查网络设备是否正常!" });
//       }
//     }
//     dbConfig.sqlConnect(sql,sqlArr,updateAvatarCallBack)
//   })
  
// }

module.exports = {
  userLogin,
  userRegister,
  sendMail,
  userIsLogined,
  userExit,
  // updateAvatar
}