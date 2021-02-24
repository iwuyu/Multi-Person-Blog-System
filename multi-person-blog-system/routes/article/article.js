var dbConfig = require('../../serve/dbConfig')
const Jwt = require("../utils/jsonwebtoken")
const fs = require('fs')
const Date1 = require('../utils/time');

// 删除文章图片/音乐
deleteImage = (type,path) =>{
  fs.unlink(`./public/${type}/${path}`, err => {
    if(err){
      console.log(err);
    }else{
      console.log('删除成功')
    }
  })
}

/**文章发布 */
articlePublish = (req, res) => {
  const {
    title,
    category,
    label,
    image,
    describe,
    content,
    token
  } = req.body;
  console.log(1111,req.body);
  Jwt
  .verifyToken(token) // 将前台传来的token进行解析
  .then(data => {
    let author = data.token.id
    const sql0 = "SELECT ban FROM USER WHERE id = ?" 
    const sqlArr0 = [author];
    getUserStatus = (err,data) => {
      console.log(data)
      if(!err){
        if(Number(data[0].ban) === 0) {
          let date = Date.parse(new Date());
          const sql = "INSERT INTO article(title, image, describes, category_id, label_id, content, time, author_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?);";
          let sqlArr = [title, image, describe, category, label, content, date, author];
          let articlePublishCallBack = (err) => {
            if (!err) {
              // 发表成功
              return res.json({
                statusCode: 200,
                message: "发表成功"
              });
            } else {
              // 发表失败
              let paths = image.split("/");
              let path = paths[paths.length -1];
              deleteImage('images',path);
              return res.json({
                statusCode: 900,
                message: "出错了，请检查网络设备是否正常"
              });
            }
          }
          dbConfig.sqlConnect(sql, sqlArr, articlePublishCallBack)
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

// 查询分类
getCategory = (req,res) => {
  const sql = "SELECT * FROM category";
  let getCategoryCallBack = (err,data) => {
    if(!err){
      return res.json({
        statusCode:200,
        message: "查询成功",
        data
      });
    }else {
      return res.json({
        statusCode: 900,
        message: "出错了，请检查网络设备是否正常"
      });
    }
  }
  dbConfig.sqlConnect(sql,getCategoryCallBack)
}
// 查询标签
getLabel = (req,res) => {
  const sql = `SELECT label.*,category.category_name 
               FROM category,label 
               WHERE label.category_id = category.category_id`;
  let getLabelCallBack = (err,data) => {
    if(!err){
      return res.json({
        statusCode:200,
        message: "查询成功",
        data
      });
    }else {
      return res.json({
        statusCode: 900,
        message: "出错了，请检查网络设备是否正常"
      });
    }
  }
  dbConfig.sqlConnect(sql,getLabelCallBack)
}

/* 查询文章总数量 */
/**
 * 4个参数
 */
getArticlesCount = (req,res) => {
  const { categoryId,labelId, keyword, author,articleStatus } = req.query
    let sqlArr;
    let sql;
    if(keyword == ""){
      if(categoryId == "") {
        sql = author ? `SELECT COUNT(*) AS count FROM article WHERE author_id = ? AND reviewed = ?`:`SELECT COUNT(*) AS count FROM article WHERE reviewed = ?`
        sqlArr= author ? [author,articleStatus]:[articleStatus]
      }else {
        if(labelId === ""){
          sql = author ? `SELECT COUNT(*) AS count FROM article WHERE category_id = ? AND author_id = ? AND reviewed = ?`:`SELECT COUNT(*) AS count FROM article WHERE category_id = ? AND reviewed = ?`
          sqlArr = author ? [categoryId,author,articleStatus] : [categoryId,articleStatus];
        }else {
          sql = author ? `SELECT COUNT(*) AS count FROM article WHERE label_id = ? AND author_id = ? AND reviewed = ?`:`SELECT COUNT(*) AS count FROM article WHERE label_id = ? AND reviewed = ?`
          sqlArr = author ? [labelId,author,articleStatus] : [labelId,articleStatus];
        }
      }
    }else {
      sql = author ? `SELECT COUNT(*) AS count FROM article WHERE title LIKE ? AND  author_id = ? AND reviewed = ?`:`SELECT COUNT(*) AS count FROM article WHERE title LIKE ? AND reviewed = ?`
      let keywords = `%${keyword}%`
      sqlArr = author ? [keywords,author,articleStatus] : [keywords,articleStatus];
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

/* 查询文章 */
/**
 * 6个参数
 * author='' : 查询所有文章
 * author=*  : 查询用户id为*的文章
 * c.comment_count article LEFT JOIN(SELECT parent_id,COUNT(*) AS comment_count FROM COMMENT) AS c ON c.parent_id = article.id
 */
getArticle = (req,res) => {
  const {categoryId,labelId,keyword,currentPage,pageSize, author, articleStatus} = req.query;
  let categoryId1  = parseInt(categoryId);
  let labelId1  = parseInt(labelId);
  let currentPage1 = (currentPage - 1) * pageSize;
  let pageSize1 = pageSize * 1;
  let sql;
  let sqlArr;
  if(keyword == ""){
    if(!categoryId1){
      if(!labelId){
        sql = author ? `SELECT article.*,label.label_name,category.category_name,user.username 
               FROM label,category,user,article
               WHERE article.label_id = label.label_id AND article.category_id = category.category_id AND article.author_id = user.id AND article.author_id = ? AND article.reviewed = ? ORDER BY article.id DESC LIMIT ?,?`:
               `SELECT article.*,label.label_name,category.category_name,user.username
               FROM label,category,user,article
               WHERE article.label_id = label.label_id AND article.category_id = category.category_id AND article.author_id = user.id AND article.reviewed = ? ORDER BY article.id DESC LIMIT ?,?`
        sqlArr= author ? [author,articleStatus,currentPage1,pageSize1]:[articleStatus,currentPage1,pageSize1]
      }else {
        sql = author ? `SELECT article.*,label.label_name,category.category_name,user.username
               FROM label,category,user,article 
               WHERE article.label_id = label.label_id AND article.category_id = category.category_id AND article.author_id = user.id AND article.author_id = ? AND article.label_id = ? AND article.reviewed = ? ORDER BY article.id DESC LIMIT ?,?`:
               `SELECT article.*,label.label_name,category.category_name,user.username  
               FROM label,category,user,article  
               WHERE article.label_id = label.label_id AND article.category_id = category.category_id AND article.author_id = user.id AND article.label_id = ? AND article.reviewed = ? ORDER BY article.id DESC LIMIT ?,?`
        sqlArr= author ? [author,labelId1,articleStatus,currentPage1,pageSize1]:[labelId1,articleStatus,currentPage1,pageSize1]
      }
    }else {
      if(!labelId1){
        sql = author ? `SELECT article.*,label.label_name,category.category_name,user.username  
               FROM label,category,user,article   
               WHERE article.label_id = label.label_id AND article.category_id = category.category_id AND article.author_id = user.id AND article.author_id = ? AND article.category_id = ? AND article.reviewed = ? ORDER BY article.id DESC LIMIT ?,?`:
               `SELECT article.*,label.label_name,category.category_name,user.username  
               FROM label,category,user,article   
               WHERE article.label_id = label.label_id AND article.category_id = category.category_id AND article.author_id = user.id AND article.category_id = ? AND article.reviewed = ? ORDER BY article.id DESC LIMIT ?,?`
        sqlArr= author ? [author,categoryId1,articleStatus,currentPage1,pageSize1]:[categoryId1,articleStatus,currentPage1,pageSize1]
      }else {
        sql = author ? `SELECT article.*,label.label_name,category.category_name,user.username 
               FROM label,category,user,article  
               WHERE article.label_id = label.label_id AND article.category_id = category.category_id AND article.author_id = user.id AND article.author_id = ? AND article.label_id = ? AND article.reviewed = ? ORDER BY article.id DESC LIMIT ?,?`:
               `SELECT article.*,label.label_name,category.category_name,user.username  
               FROM label,category,user,article 
               WHERE article.label_id = label.label_id AND article.category_id = category.category_id AND article.author_id = user.id AND article.label_id = ? AND article.reviewed = ? ORDER BY article.id DESC LIMIT ?,?`
        sqlArr= author ? [author,labelId1,articleStatus,currentPage1,pageSize1]:[labelId1,articleStatus,currentPage1,pageSize1]
      }
    }
  }else {
    sql = author ? `SELECT article.*,label.label_name,category.category_name,user.username  
           FROM label,category,user,article   
           WHERE article.label_id = label.label_id AND article.category_id = category.category_id AND article.author_id = user.id AND article.author_id = ? AND article.title LIKE ? AND article.reviewed = ? ORDER BY article.id DESC LIMIT ?,?`:
           `SELECT article.*,label.label_name,category.category_name,user.username  
           FROM label,category,user,article   
           WHERE article.label_id = label.label_id AND article.category_id = category.category_id AND article.author_id = user.id AND article.title LIKE ? AND article.reviewed = ? ORDER BY article.id DESC LIMIT ?,?`
    let keywords = `%${keyword}%`;
    sqlArr = author ? [author,keywords,articleStatus,currentPage1,pageSize1]:[keywords,articleStatus,currentPage1,pageSize1]
  }
  let getArticleCallBack = (err,data) => {
    if(!err){
      data.forEach((item,index) => {
        item.time = articleStatus == 1 ? Date1.getTime(item.time,"YMD") : Date1.getTime(item.time,"YMDhm");
        const sql1 = 'SELECT COUNT(*) AS comment_count FROM COMMENT WHERE parent_id = ?'
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
  dbConfig.sqlConnect(sql,sqlArr,getArticleCallBack)
}

/* 修改文章 */
updataArticle = (req, res) => {
  const {
    articleId,
    title,
    category,
    label,
    image,
    describe,
    content,
    token
  } = req.body;
  Jwt
  .verifyToken(token) // 将前台传来的token进行解析
  .then(data => {
    let author = data.token.id
    // 如果修改图片路径跟数据库里不一样，删除之前的
    const sqlImg = "SELECT image FROM article WHERE id = ?";
    let sqlArrImg = [articleId];
    let selectImgCallBack = (err,data) => {
      if(!err) {
        if(data[0].image != image) {
          let paths = data[0].image.split("/");
          let path = paths[paths.length -1];
          deleteImage('images',path);
        }
      }
    }
    dbConfig.sqlConnect(sqlImg, sqlArrImg, selectImgCallBack);
    const sql ="UPDATE article SET title = ?,image = ?,describes = ?,category_id = ?,label_id = ?,content = ? WHERE id = ? AND author_id = ?";
    let sqlArr = [title, image, describe, category, label, content, articleId, author];
    let updateArticleCallBack = (err) => {
      if (!err) {
        // 发表成功
        return res.json({
          statusCode: 200,
          message: "修改成功"
        });
      } else {
        // 发表失败
        return res.json({
          statusCode: 900,
          message: "出错了，请检查网络设备是否正常!"
        });
      }
    }
    dbConfig.sqlConnect(sql, sqlArr, updateArticleCallBack)
  })
};

// 删除文章
deleteArticle = (req,res) => {
  const {token,articleId,image} = req.body
  Jwt
  .verifyToken(token) // 将前台传来的token进行解析
  .then(data => {
    if(data.token.id > 0){
      const sql = "DELETE FROM article WHERE id = ?";
      let sqlArr = [articleId];
      let deleteArticleCallBack = err => {
        if(!err){
          // 删除成功
          // 删除该文章的图片
          deleteImage('images',image);
          const sql0 = "SELECT id FROM comment WHERE parent_id = ?"
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
      dbConfig.sqlConnect(sql, sqlArr, deleteArticleCallBack)
    } else {
      return res.json({
        statusCode: 500,
        message: "您们没有权限，请登录后再来吧!"
      });
    }
  })
}

/** 审核文章
 * status
 * 0 : 未审核
 * 1 : 审核通过
 * 2 : 审核不通过
*/ 
reviewedArticle = (req, res) => {
  if(req.session.adminIslogin) {
    // 管理员已登录
    const {status,articleId} = req.body
    const sql = "UPDATE article SET reviewed = ? where id = ?"
    const sqlArr = [status,articleId]
    let reviewArticleCallBack = err => {
      if(err){
        return res.json({
          statusCode: 900,
          message: "出错了，请检查网络设备是否正常"
        });
      }else{
        if(status === 1){
          return res.json({
            statusCode: 200,
            message: '该文章审核已通过'
          });
        }else {
          return res.json({
            statusCode: 200,
            message: '该文章审核不通过'
          });
        }
      }
    }
    dbConfig.sqlConnect(sql, sqlArr, reviewArticleCallBack)
  } else {
    return res.json({
      statusCode: 500,
      message: '对不起，您没有权限哦！'
    });
  }
}

/** 文章点赞 */
articleLike = (req,res) => {
  const {articleId} = req.body;
  // 1.查询原有赞数
  const sql = "SELECT likes FROM article WHERE id = ?";
  let sqlArr = [articleId];
  let articleLikeCallBack = (err,data) => {
    if(err) {
      return res.json({
        statusCode: 900,
        message: "出错了，请检查网络设备是否正常!"
      });
    }else {
      let articleLikes = data[0].likes + 1;
      const sql2 = "UPDATE article SET likes = ? WHERE id = ?"
      let sqlArr2 = [articleLikes,articleId];
      let updataArticleLikesCallBack = (err) => {
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
      dbConfig.sqlConnect(sql2,sqlArr2,updataArticleLikesCallBack)
    }
  }
  dbConfig.sqlConnect(sql,sqlArr,articleLikeCallBack)
}

/**
 * 获取文章详情
 */
getArticleDetail = (req,res) => {
  const { id } = req.query
  const sql = `SELECT article.*,label.label_name,category.category_name,user.username
               FROM article,label,category,user
               WHERE article.label_id = label.label_id AND article.category_id = category.category_id AND article.author_id = user.id AND article.id = ?`
  const sqlArr = [id]
  let getArticleDetailCallBack = (err,data) => {
    if(!err){
      const sql2 = "UPDATE article SET access = ? WHERE id = ?";
      let sqlArr2 = [++data[0].access,id]
      let updateViews = (err) => {
        if(err) {
          console.log('失败')
        }
      }
      dbConfig.sqlConnect(sql2,sqlArr2,updateViews);
      data[0].time = Date1.getTime(data[0].time,"YMD");
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
  dbConfig.sqlConnect(sql,sqlArr,getArticleDetailCallBack)   
}

/**
 * 评论
 */
leaveComment = (req,res) => {
  const { parentId, type, content, token, isReply} = req.body;
  console.log(req.body)
  Jwt
  .verifyToken(token) // 将前台传来的token进行解析
  .then(data => {
    let author = data.token.id
    const time = Date.parse(new Date());
    let sql;
    let sqlArr;
    isReply?sql = 'INSERT INTO reply(parent_id, content, user_id, time, type, grand_id, parent_user_id) VALUES(?, ?, ?, ?, ?, ?, ?)':sql = 'INSERT INTO comment(parent_id, content, user_id, time, type) VALUES(?, ?, ?, ?, ?)'
    isReply ? sqlArr = [parentId,content,author,time,type,req.body.grandId,req.body.parentUser] : sqlArr = [parentId,content,author,time,type]
    let commentCallBack = err => {
      if(err){
        return res.json({
          statusCode: 900,
          message: "出错了，请检查网络设备是否正常"
        });
      }else{
        return res.json({
          statusCode: 200,
          message: '恭喜你留言成功'
        });
      }
    }
    dbConfig.sqlConnect(sql, sqlArr, commentCallBack)
  }).catch(err => {
    return res.json({
      statusCode: 901,
      message: '您的账号已超时，请重新登录'
    });
  })
}

/* 判断是否有评论 */
hasComment = (req,res) => {
  const { id } = req.query
  const sql = `SELECT COUNT(*) AS count FROM COMMENT WHERE parent_id = ?`;
  const sqlArr = [id];
  let hasCommentCallBack = (err, data) => {
    if(!err) {
      return res.json({
        statusCode: 200,
        message: "查询成功",
        data: data[0]
      });
    }else {
      return res.json({
        statusCode: 900,
        message: "出错了，请检查网络设备是否正常!"
      });
    }
  }
  dbConfig.sqlConnect(sql,sqlArr,hasCommentCallBack)
}

/* 获取文章评论与回复 */
getComment = (req,res) => {
  const { id, type } = req.query
  console.log(req.query)
  if(id){
    const sql = `SELECT comment.*,user.username,user.avatar
                 FROM comment,user
                 WHERE comment.user_id = user.id AND comment.parent_id = ? AND comment.type = ?`
    const sqlArr = [id, type]
    let getCommentCallBack = (err,data) => {
      if(!err){
        if(data.length > 0){
          /* 如果有留言继续查询回复信息 */
          let count = 1; // 声明一个留言的数量，用于判断遍历到第几个留言
          data.forEach(item => {
            item.time = Date1.getTime(item.time,"YMDhm");
            /* 声明查询回复的sql语句 */
            const sql2 = ' SELECT us.username AS parent_user,re.* FROM (SELECT u.username AS son_user,u.avatar,r.* FROM (SELECT * FROM reply WHERE grand_id=?) AS r LEFT JOIN USER AS u ON r.user_id=u.id) AS re LEFT JOIN USER AS us ON re.parent_user_id=us.id;'
            /* 查询回复的对象 */
            let sqlArr2 = [item.id];
            /* 执行查询回复时的回调函数 */
            let getReplyCallBack = (err,value) => {
              if(!err){
                value.forEach(key => {
                  key.time = Date1.getTime(key.time,"YMDhm");
                });
                item.reply = value; // 把回复信息放入对应的留言中
                if(count == data.length){
                  /* 留言信息遍历结束 */
                  return res.json({
                    statusCode: 200,
                    message: "查询成功",
                    data
                  });
                }
                count ++;
              }else {
                return res.json({
                  statusCode: 900,
                  message: "出错了，请检查网络设备是否正常!"
                });
              }
            }
            dbConfig.sqlConnect(sql2,sqlArr2,getReplyCallBack); // 查询回复
          })
        }
      }else {
        return res.json({
          statusCode: 900,
          message: "出错了，请检查网络设备是否正常!"
        });
      }
    }
    dbConfig.sqlConnect(sql,sqlArr,getCommentCallBack)
  }else{
    return res.json({
      statusCode: 900,
      message: "出错了，请检查网络设备是否正常!"
    });
  }  
}

/* 删除文章评论 */ 
deteleComment = (req,res) => {
  const { token, articleId, commentId} = req.body;
  // 验证作者权限
  Jwt
  .verifyToken(token) // 将前台传来的token进行解析
  .then(data => {
    let author = data.token.id
    const sql = "SELECT author_id FROM article WHERE id = ?"
    const sqlArr = [articleId];
    searchAuthorCallBack = (err,data) => {
      if (!err) {
        if(data[0].author_id === author){
          // 文章作者是本人，允许删除
          const sql1 = "SELECT * FROM reply WHERE parent_id = ? AND type = 1";
          let sqlArr1 = [commentId];
          let deleteMessageCallBack = (err,data) => {
            if (!err) {
              // 查询成功
              let sql2;
              sql2 = data.length > 0 ? "DELETE COMMENT,reply FROM COMMENT INNER JOIN reply ON comment.id = reply.grand_id WHERE  comment.id = ?" : "DELETE FROM comment WHERE id = ?"
              let deleteMessageCallBack1 = err => {
                if(!err){
                  // 删除成功
                  // updateArticleMessageCount(articleId) // 更改文章留言数
                  return res.json({
                    statusCode: 200,
                    message: "删除成功"
                  });
                }else {
                  // 删除失败
                  return res.json({
                    statusCode: 900,
                    message: "出错了，请检查网络设备是否正常!"
                  });
                }
              }
              dbConfig.sqlConnect(sql2, sqlArr1, deleteMessageCallBack1) 
            }else {
              // 查询失败
              return res.json({
                statusCode: 900,
                message: "出错了，请检查网络设备是否正常!"
              });
            }
          }
          dbConfig.sqlConnect(sql1, sqlArr1, deleteMessageCallBack)
        }else {
          // 不是作者本人，提示不允许删除
          return res.json({
            statusCode: 500,
            message: "您不是作者本人，无权删除该留言!"
          });
        }
      }else {
        // 查询失败
        return res.json({
          statusCode: 900,
          message: "出错了，请检查网络设备是否正常!"
        });
      }
    }
    dbConfig.sqlConnect(sql, sqlArr, searchAuthorCallBack)
  })
}



module.exports = {
  articlePublish,
  getCategory,
  getLabel,
  getArticle,
  getArticlesCount,
  updataArticle,
  reviewedArticle,
  articleLike,
  getArticleDetail,
  leaveComment,
  deteleComment,
  hasComment,
  getComment,
  deleteArticle
}