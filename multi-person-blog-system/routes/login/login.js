// var dbConfig = require('../../utils/dbConfig');
let Mail = require('../../utils/mail');

let codes = {} // 通过内存保存验证码信息
let time = {} // 保存发送时长
let time2 = {} // 保存验证码存放时长
let timer2 = {}; // 保存验证码时长定时器

/* 发送邮箱验证码 */
sendMail = (req,res) => {
  console.log(req.body)
  console.log(req.body.mail)
  const { mail } = req.body;
  const sql = "SELECT name FROM admin WHERE email = ?";
  let sqlArr = [ mail ];
  let sendMailCallBack = (err,data) => {
    if(!err) {
      if(data.length > 0){
        // 查询到该邮箱
        if(!time.hasOwnProperty(mail)){
          // 判断内存中没有该邮箱的限制时长
          let code = parseInt(Math.random()*10000) // 产生随机验证码
          Mail.send(mail,code).then(() => {
            codes[mail] = code; // 将邮箱和邮箱匹配的验证码保存到缓存中
            res.send({
              statusCode: 200,
              message:'验证码发送成功！请注意查收︿(￣︶￣)︿'
            });
          }).catch(err => {
            res.send({
              statusCode: 400,
              message:'验证码发送失败,请检查您的邮箱是否正确(ノへ￣、)'
            });
          });
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
            statusCode: 600,
            message:`发送太频繁了，请${60 - time[mail]}秒后再试(ノへ￣、)`
          });
        }
      }else {
        /* 未查询到该用户 */
        res.send({ 
          statusCode: 700, 
          message: "该邮箱还未被注册(ノへ￣、)" 
        });
      }
    }else {
      res.send({ 
        statusCode: 900, 
        message: "网络有点不给力! 请稍后再试哦(＞﹏＜)" 
      });
    }
  }
  dbConfig.sqlConnect(sql,sqlArr,sendMailCallBack)
}

/* 后台登录 */
adminLogin = (req,res) => {
  const { email, password, code } = req.body;
  console.log(req.body)
  console.log(req.body.email)
  if(codes[email]){
    if(codes[email] == code){
      const sql = "SELECT name FROM admin WHERE email = ? AND passwd = ?";
      let sqlArr = [email, password];
      let callBack = (err,data) =>{
        if(!err) {
          if(data.length > 0){
            // 存在
            req.session.adminlogin = true; // 登录成功记录状态
            delete codes[email]; // 删除验证码
            res.send({
              statusCode:200,
              message:"欢迎进入管理系统ヾ(≧▽≦*)o"
            })
          }else {
            res.send({
              statusCode:400,
              message:"出错了! 请验证参数是否正确哦(ノへ￣、)"
            })
          }
        }else {
          res.send({ 
            statusCode: 900, 
            message: "网络有点不给力! 请稍后再试哦(＞﹏＜)" 
          });
        }
      }
      dbConfig.sqlConnect(sql,sqlArr,callBack);
    }else {
      res.send({
        statusCode:400,
        message:"验证码不对哦(ノへ￣、)"
      })
    }
  }else {
    res.send({
      statusCode:700,
      message:"您还没有发送验证码哦(ノへ￣、)"
    })
  }
}

module.exports = {
  adminLogin,
  sendMail
}