var dbConfig = require('../../serve/dbConfig')
const Jwt = require("../utils/jsonwebtoken")
const fs = require('fs')
const Date1 = require('../utils/time')

// 获取目标用户信息
async function getTargetAuthorInfo(id) {
  return new Promise((resolve,reject) => {
    let sqlStr='SELECT id AS target_id,username AS target_username,avatar AS target_avatar FROM USER WHERE id = ?'
    const sqlArray = [id]
    const getTargetAuthorCallBack = (err,data) => {
      if(err) {
        reject('获取评论的目标作者失败');
      }else {
        console.log('他的里',data[0]);
        resolve(data[0])
      }
    }
    dbConfig.sqlConnect(sqlStr, sqlArray,getTargetAuthorCallBack)
  })
}
// 获取目标个人信息
async function getAuthorInfo(id) {
  return new Promise((resolve,reject) => {
    let sqlStr='SELECT id AS author_id,username AS author_username,avatar AS author_avatar FROM USER WHERE id = ?'
    const sqlArray = [id]
    const getAuthorCallBack = (err,data) => {
      if(err) {
        reject('获取评论的目标作者失败');
      }else {
        console.log('我的里',data[0]);
        resolve(data[0])
      }
    }
    dbConfig.sqlConnect(sqlStr, sqlArray,getAuthorCallBack)
  })
}

// 获取私信用户列表
getLetterList = (req , res) => {
  const { token } = req.query
  Jwt
  .verifyToken(token) // 将前台传来的token进行解析
  .then(data => {
    let author = data.token.id
    const sqlArr = [author]
    const sql = 'SELECT * FROM letter_list WHERE author_id = ?'
    async function getLetterListCallBack(err,data1) {
      if(!err) {
        const userLists = []
        for(let i = 0; i < data1.length; i++){
          let targetInfo = await getTargetAuthorInfo(data1[i].target_id)
          userLists.push(targetInfo)
        }
        let authorInfo = await getAuthorInfo(author)
        console.log('我的外',authorInfo);
        const data = {}
        data.userLists = userLists
        data.author = authorInfo
        return res.json({
          statusCode: 200,
          message: "查询私信列表成功",
          data
        });
      }else {
        return res.json({
          statusCode: 900,
          message: "出错了，请检查网络设备是否正常"
        });
      }
    }
    dbConfig.sqlConnect(sql, sqlArr,getLetterListCallBack)
  })
}

// 获取私信内容
getLetter = (req , res) => {
  const { token,targetId } = req.query
  console.log(req.query);
  Jwt
  .verifyToken(token) // 将前台传来的token进行解析
  .then(data => {
    let author = data.token.id
    const sqlArr = [author,targetId,targetId,author]
    const sql = `SELECT l.*,
                 (SELECT username FROM USER WHERE id = l.author_id) AS author_name,
                 (SELECT avatar FROM USER WHERE id = l.author_id) AS author_avatar,
                 (SELECT username FROM USER WHERE id = l.target_id) AS target_name,
                 (SELECT avatar FROM USER WHERE id = l.target_id) AS target_avatar
                 FROM letter AS l  
                 WHERE author_id = ? AND target_id = ? OR author_id = ? AND target_id = ?`
    function getLetterCallBack(err,data) {
      if(!err) {
        data.forEach((item,index) => {
          item.time = Date1.getTime(item.time,"YMDhm");
        })
        return res.json({
          statusCode: 200,
          message: "查询私信内容成功",
          data
        });
      }else {
        return res.json({
          statusCode: 900,
          message: "出错了，请检查网络设备是否正常"
        });
      }
    }
    dbConfig.sqlConnect(sql, sqlArr,getLetterCallBack)
  })
}

// 删除私信
deleteLetter = (req,res) => {
  const { token,letterId } = req.body
  Jwt
  .verifyToken(token) // 将前台传来的token进行解析
  .then(data => {
    if(data.token.id > 0){
      const sql = "DELETE FROM letter WHERE id = ?";
      const sqlArr = [letterId];
      let deleteLetterCallBack = err => {
        if(err) {
          return res.json({
            statusCode: 900,
            message: "出错了，请检查网络设备是否正常"
          });
        }else {
          return res.json({
            statusCode: 200,
            message: "删除成功"
          });
        }
      }
      dbConfig.sqlConnect(sql, sqlArr,deleteLetterCallBack)
    }else {
      return res.json({
        statusCode: 500,
        message: "你没有权限"
      });
    }
  })
}

/* 私信发言 */
speakWord = (req, res) => {
  const {
    hisId,
    word,
    token,
    image,
    isImage
  } = req.body;
  Jwt
  .verifyToken(token) // 将前台传来的token进行解析
  .then(data => {
    let author = data.token.id
    let date = Date.parse(new Date());
    const sql = "INSERT INTO letter(author_id, target_id, say_word, time, image_url, is_img) VALUES(?, ?, ?, ?,?,?);";
    let sqlArr = [author,hisId, word,date,image,isImage];
    let speakWordCallBack = (err) => {
      if (!err) {
        // 发表成功
        return res.json({
          statusCode: 200,
          message: "私信成功"
        });
      } else {
        // 发表失败
        return res.json({
          statusCode: 900,
          message: "出错了，请检查网络设备是否正常"
        });
      }
    }
    dbConfig.sqlConnect(sql, sqlArr, speakWordCallBack)
  })
}

module.exports = {
  getLetterList,
  speakWord,
  getLetter,
  deleteLetter
}