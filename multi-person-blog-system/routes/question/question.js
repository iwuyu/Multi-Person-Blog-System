var dbConfig = require('../../serve/dbConfig')
const Jwt = require("../utils/jsonwebtoken")
const fs = require('fs')
const Date1 = require('../utils/time');

/* 获取问答标签 */
getQuestionLabel = (req,res) => {
  const sql = 'SELECT * FROM q_label'
  getQuestionLabelCallBack = (err,data) => {
    if(!err) {
      return res.json({
        statusCode: 200,
        message: "获取问答标签成功",
        data
      });
    }else {
      return res.json({
        statusCode: 900,
        message: "出错了，请检查网络设备是否正常"
      });
    }
  }
  dbConfig.sqlConnect(sql, getQuestionLabelCallBack)
}

/* 问答发布 */
questionPublish = (req, res) => {
  const {
    title,
    label,
    describe,
    token
  } = req.body;
  Jwt
  .verifyToken(token) // 将前台传来的token进行解析
  .then(data => {
    let author = data.token.id
    const sql0 = "SELECT ban FROM USER WHERE id = ?" 
    const sqlArr0 = [author];
    let getUserStatus = (err,data) => {
      if(!err){
        if(Number(data[0].ban) === 0) {
          // 作者没有被禁言
          let date = Date.parse(new Date());
          const sql = "INSERT INTO question(title, describes, label_id, time, author_id) VALUES(?, ?, ?, ?, ?);";
          let sqlArr = [title,describe, label,date, author];
          let questionPublishCallBack = (err) => {
            if (!err) {
              // 发表成功
              return res.json({
                statusCode: 200,
                message: "问答发表成功"
              });
            } else {
              // 发表失败
              return res.json({
                statusCode: 400,
                message: "出错了，请检查网络设备是否正常"
              });
            }
          }
          dbConfig.sqlConnect(sql, sqlArr, questionPublishCallBack)
        }else {
          return res.json({
            statusCode: 500,
            message: "您已被禁言，请联系管理员！"
          });
        }
      }else {
        return res.json({
          statusCode: 900,
          message: "出错了，请检查网络设备是否正常"
        });
      }
    }
    dbConfig.sqlConnect(sql0, sqlArr0, getUserStatus)
  })
};

/* 问答删除 */
deleteQuestion = (req,res) => {
  const {token,questionId} = req.body
  Jwt
  .verifyToken(token) // 将前台传来的token进行解析
  .then(data => {
    if(data.token.id > 0){
      const sql = "DELETE FROM question WHERE id = ?";
      let sqlArr = [questionId];
      let deleteQuestionCallBack = err => {
        if(!err){
          // 删除成功
          const sql0 = "SELECT id FROM comment WHERE parent_id = ? AND type = 2"
          let getMessageIdCallBack = (err,data) => {
            data.forEach((item,index) => {
              const sql2 = "SELECT * FROM reply WHERE grand_id = ?";
              let sqlArr1 = [item.id];
              let getReplyCallBack = (err,data1) => {
                if (!err) {
                  // 查询成功
                    // 有回复，一起删除
                    let sql1;
                    data1.length > 0 ? sql1 = "DELETE comment,reply FROM comment INNER JOIN reply ON comment.id = reply.grand_id WHERE comment.id = ?" : sql1 = "DELETE FROM comment WHERE id = ?"
                    // console.log(sql1)
                    let deleteMessageCallBack = err => {
                      if(!err){
                        if(index == data.length - 1){
                          // 删除成功
                          return res.json({
                            statusCode: 200,
                            message: "删除成功"
                          }); 
                        }
                      }else {
                        console.log('全部执行并失败')
                        // 删除失败
                        return res.json({
                          statusCode: 900,
                          message: "出错了，请检查网络设备是否正常!"
                        });
                      }
                    }
                    dbConfig.sqlConnect(sql1, sqlArr1, deleteMessageCallBack) // 有回复，一起删除
                }else {
                  // 查询失败
                  return res.json({
                    statusCode: 900,
                    message: "出错了，请检查网络设备是否正常!"
                  });
                }
              }
              dbConfig.sqlConnect(sql2, sqlArr1, getReplyCallBack)
            })
          } 
          dbConfig.sqlConnect(sql0, sqlArr, getMessageIdCallBack) //查询留言id
        }else {
          // 删除失败
          return res.json({
            statusCode: 900,
            message: "出错了，请检查网络设备是否正常!"
          });
        }
      }
      dbConfig.sqlConnect(sql, sqlArr, deleteQuestionCallBack)
    } else {
      return res.json({
        statusCode: 500,
        message: "您们没有权限，请登录后再来吧!"
      });
    }
  })
}

/* 查询问答总数量 */
getquestionsCount = (req,res) => {
  const { labelId, keyword, author,questionStatus } = req.query
    let sqlArr;
    let sql;
    if(keyword == ""){
      if(labelId === ""){
        sql = author ? `SELECT COUNT(*) AS count FROM question WHERE author_id = ? AND reviewed = ?`:`SELECT COUNT(*) AS count FROM question WHERE reviewed = ?`
        sqlArr = author ? [author,questionStatus] : [questionStatus];
      }else {
        sql = author ? `SELECT COUNT(*) AS count FROM question WHERE label_id = ? AND author_id = ? AND reviewed = ?`:`SELECT COUNT(*) AS count FROM question WHERE label_id = ? AND reviewed = ?`
        sqlArr = author ? [labelId,author,questionStatus] : [labelId,questionStatus];
      }
    }else {
      sql = author ? `SELECT COUNT(*) AS count FROM question WHERE title LIKE ? AND  author_id = ? AND reviewed = ?`:`SELECT COUNT(*) AS count FROM question WHERE title LIKE ? AND reviewed = ?`
      let keywords = `%${keyword}%`
      sqlArr = author ? [keywords,author,questionStatus] : [keywords,questionStatus];
    }
    callBack = (err, data) => {
      if(!err){
        return res.json({
          statusCode: 200,
          message: "查询成功",
          data
        });
      }else {
        return res.json({
          statusCode: 900,
          message: "出错了，请检查网络设备是否正常!"
        });
      }
    }
    dbConfig.sqlConnect(sql,sqlArr,callBack);
}

/* 查询问答 */
getQuestion = (req,res) => {
  const {labelId,keyword,currentPage,pageSize, author, questionStatus} = req.query;
  let labelId1  = parseInt(labelId);
  let currentPage1 = (currentPage - 1) * pageSize;
  let pageSize1 = pageSize * 1;
  let sql;
  let sqlArr;
  if(keyword == ""){
    if(!labelId){
      sql = author ? `SELECT question.*,q_label.name,user.username 
             FROM q_label,user,question
             WHERE question.label_id = q_label.id AND question.author_id = user.id AND question.author_id = ? AND question.reviewed = ? ORDER BY question.id DESC LIMIT ?,?`:
             `SELECT question.*,q_label.name,user.username
             FROM q_label,user,question
             WHERE question.label_id = q_label.id  AND question.author_id = user.id AND question.reviewed = ? ORDER BY question.id DESC LIMIT ?,?`
      sqlArr= author ? [author,questionStatus,currentPage1,pageSize1]:[questionStatus,currentPage1,pageSize1]
      console.log(sqlArr);
    }else {
      sql = author ? `SELECT question.*,q_label.name,user.username
             FROM q_label,user,question 
             WHERE question.label_id = q_label.id AND question.author_id = user.id AND question.author_id = ? AND question.label_id = ? AND question.reviewed = ? ORDER BY question.id DESC LIMIT ?,?`:
             `SELECT question.*,q_label.name,user.username  
             FROM q_label,user,question  
             WHERE question.label_id = q_label.id AND question.author_id = user.id AND question.label_id = ? AND question.reviewed = ? ORDER BY question.id DESC LIMIT ?,?`
      sqlArr= author ? [author,labelId1,questionStatus,currentPage1,pageSize1]:[labelId1,questionStatus,currentPage1,pageSize1]
    }
  }else {
    sql = author ? `SELECT question.*,q_label.name,user.username  
           FROM q_label,user,question   
           WHERE question.label_id = q_label.id AND question.author_id = user.id AND question.author_id = ? AND question.title LIKE ? AND question.reviewed = ? ORDER BY question.id DESC LIMIT ?,?`:
           `SELECT question.*,q_label.name,user.username  
           FROM q_label,user,question   
           WHERE question.label_id = q_label.id AND question.author_id = user.id AND question.title LIKE ? AND question.reviewed = ? ORDER BY question.id DESC LIMIT ?,?`
    let keywords = `%${keyword}%`;
    sqlArr = author ? [author,keywords,questionStatus,currentPage1,pageSize1]:[keywords,questionStatus,currentPage1,pageSize1]
  }
  let getQuestionCallBack = (err,data) => {
    if(!err){
      data.forEach((item,index) => {
        item.time = Date1.getTime(item.time,"YMDhm");
        const sql1 = 'SELECT COUNT(*) AS comment_count FROM COMMENT WHERE parent_id = ? and type = 2'
        const sqlArr1 = [item.id]
        let getCommentCallBack = (err,data1) => {
          item.comment_count = data1[0].comment_count
        }
        dbConfig.sqlConnect(sql1,sqlArr1,getCommentCallBack)
      // }
      })
      setTimeout(() => {
        return res.json({
          statusCode: 200,
          message: "查询成功",
          data
        });
      }, 300);
    }else {
      return res.json({
        statusCode: 900,
        message: "出错了，请检查网络设备是否正常!"
      });
    }
  }
  dbConfig.sqlConnect(sql,sqlArr,getQuestionCallBack)
}

/* 获取问答详情 */
getQuestionDetail = (req,res) => {
  const { id } = req.query
  const sql = `SELECT question.*,q_label.name,user.username,user.avatar
               FROM question,q_label,user
               WHERE question.label_id = q_label.id AND question.author_id = user.id AND question.id = ?`
  const sqlArr = [id]
  let getQuestionDetailCallBack = (err,data) => {
    if(!err){
      const sql2 = "UPDATE question SET access = ? WHERE id = ?";
      let sqlArr2 = [++data[0].access,id]
      let updateViews = (err) => {
        if(err) {
          console.log('失败')
        }
      }
      dbConfig.sqlConnect(sql2,sqlArr2,updateViews);
      data[0].time = Date1.getTime(data[0].time,"YMDhm");
      return res.json({
        statusCode: 200,
        message: "查询成功",
        data:data[0]
      });
    }else {
      return res.json({
        statusCode: 900,
        message: "出错了，请检查网络设备是否正常!"
      });
    }
  }
  dbConfig.sqlConnect(sql,sqlArr,getQuestionDetailCallBack)   
}

/** 文章点赞 */
questionLike = (req,res) => {
  const {questionId} = req.body;
  // 1.查询原有赞数
  const sql = "SELECT likes FROM question WHERE id = ?";
  let sqlArr = [questionId];
  let questionLikeCallBack = (err,data) => {
    if(err) {
      return res.json({
        statusCode: 900,
        message: "出错了，请检查网络设备是否正常!"
      });
    }else {
      let questionLikes = data[0].likes + 1;
      const sql2 = "UPDATE question SET likes = ? WHERE id = ?"
      let sqlArr2 = [questionLikes,questionId];
      let updataQuestionLikesCallBack = (err) => {
        if(err) {
          return res.json({
            statusCode: 900,
            message: "出错了，请检查网络设备是否正常!"
          });
        }else {
          return res.json({
            statusCode: 200,
            message: "点赞成功~ 太棒了"
          });
        }
      }
      dbConfig.sqlConnect(sql2,sqlArr2,updataQuestionLikesCallBack)
    }
  }
  dbConfig.sqlConnect(sql,sqlArr,questionLikeCallBack)
}

module.exports = {
  getQuestionLabel,
  questionPublish,
  deleteQuestion,
  getQuestion,
  getquestionsCount,
  getQuestionDetail,
  questionLike
}