var dbConfig = require('../../serve/dbConfig')
const Jwt = require("../utils/jsonwebtoken")
const fs = require('fs')
const Date1 = require('../utils/time')

// 查询所有用户
getUsers = (req,res) => {
  if(req.session.adminlogin) {
    console.log (req.query)
    const {currentPage,pageSize} = req.query
    let currentPage1 = (currentPage - 1) * pageSize;
    let pageSize1 = pageSize * 1;
    const sql = 'SELECT id,username,ban,email,register_time,avatar FROM USER LIMIT ?,?'
    const sqlArr = [currentPage1, pageSize1]
    getUsersCallBack = (err,data) => {
      if(!err){
        let count = 1;
        data.forEach(item => {
          item.register_time = Date1.getTime(item.register_time,"YMDhm");
          const sql1 = 'SELECT a.article_count,q.question_count FROM (SELECT COUNT(*) AS article_count FROM article WHERE author_id = ?)AS a,(SELECT COUNT(*) AS question_count FROM question WHERE author_id = ?)AS q'
          let sqlArr1 = [item.id,item.id]
          getArticleAndQuestionCount = (err,data1) => {
            if(!err){
              item.article_count = data1[0].article_count
              item.question_count = data1[0].question_count
              if(count == data.length) {
                return res.json({
                  statusCode: 200,
                  message: "查询成功",
                  data
                });
              }
              count++;
            }else{
              return res.json({
                statusCode: 900,
                message: "出错了，请检查网络设备是否正常!"
              });
            }
          }
          dbConfig.sqlConnect(sql1,sqlArr1,getArticleAndQuestionCount);
        })
        
      }else {
        return res.json({
          statusCode: 900,
          message: "出错了，请检查网络设备是否正常!"
        });
      }
    }
    dbConfig.sqlConnect(sql,sqlArr,getUsersCallBack);
  } else {
    return res.json({
      statusCode: 500,
      message: '对不起，您没有权限哦！'
    });
  }
}

// 修改用户禁言状态
changeStatus = (req,res) => {
  if(req.session.adminlogin) {
    const { userId} = req.body
    const sql = 'SELECT ban FROM USER WHERE id = ?'
    const sqlArr = [userId]
    getUserStatusCallBack = (err,data) => {
      if(!err){
        let status = data[0].ban == 0 ? 1 : 0
        const sql = 'UPDATE USER SET ban = ? WHERE id = ?'
        const sqlArr = [status,userId]
        changeStatusCallBack = err => {
          if(!err){
            return res.json({
              statusCode: 200,
              message: "状态修改成功"
            });
          }else {
            return res.json({
              statusCode: 900,
              message: "出错了，请检查网络设备是否正常!"
            });
          }
        }
        dbConfig.sqlConnect(sql,sqlArr,changeStatusCallBack);

      }else {
        return res.json({
          statusCode: 900,
          message: "出错了，请检查网络设备是否正常!"
        });
      }
    }
    dbConfig.sqlConnect(sql,sqlArr,getUserStatusCallBack);
  } else {
    return res.json({
      statusCode: 500,
      message: '对不起，您没有权限哦！'
    });
  }
}

// 删除用户
deleteUser = (req,res) => {
  if(req.session.adminlogin) {
    
  } else {
    return res.json({
      statusCode: 500,
      message: '对不起，您没有权限哦！'
    });
  }
}


module.exports = {
  getUsers,
  changeStatus
}