var dbConfig = require('../../serve/dbConfig');
/* 后台登录 */
adminLogin = (req,res) => {
  const { username, password } = req.body;
  console.log(req.body)
  const sql = "SELECT username FROM admin WHERE username = ? AND password = ?";
  let sqlArr = [username, password];
  let callBack = (err,data) =>{
    if(!err) {
      if(data.length > 0){
        // 存在
        req.session.adminIslogin = true; // 登录成功记录状态
        console.log(req.session.adminIslogin)
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
}

// 验证管理员是否为登录状态
adminIsLogined = (req,res) => {
  console.log(req.session.adminIslogin)
  if (req.session.adminIslogin) {
    return res.send({ statusCode: 200, message: "欢迎回来,亲爱的管理员!"});
  } else {
    return res.send({ statusCode: 900, message: "您还没有登陆,请先去登陆！"});
  }
}

// 退出后台
adminExit = (req,res) => {
  // req.session.destroy();
  return res.send({ statusCode: 200, message: "退出后台管理成功！" });
}

module.exports = {
  adminLogin,
  adminIsLogined,
  adminExit
}