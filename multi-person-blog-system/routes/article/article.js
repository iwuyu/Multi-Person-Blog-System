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
  Jwt
  .verifyToken(token) // 将前台传来的token进行解析
  .then(data => {
    let author = data.token.id
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
          statusCode: 400,
          message: "出错了，请检查网络设备是否正常"
        });
      }
    }
    dbConfig.sqlConnect(sql, sqlArr, articlePublishCallBack)
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

/* 查询商品总数量 */
/**
 * 4个参数
 */
getArticlesCount = (req,res) => {
  const { categoryId,labelId, keyword, author } = req.query
    let sqlArr;
    let sql;
    if(keyword == ""){
      if(categoryId == "") {
        sql = author ? `SELECT COUNT(*) AS count FROM article WHERE author_id = ?`:`SELECT COUNT(*) AS count FROM article`
        sqlArr = [author]
      }else {
        if(labelId === ""){
          sql = author ? `SELECT COUNT(*) AS count FROM article WHERE category_id = ? AND author_id = ?`:`SELECT COUNT(*) AS count FROM article WHERE category_id = ?`
          sqlArr = [categoryId,author];
        }else {
          sql = author ? `SELECT COUNT(*) AS count FROM article WHERE label_id = ? AND author_id = ?`:`SELECT COUNT(*) AS count FROM article WHERE label_id = ?`
          sqlArr = [labelId,author];
        }
      }
    }else {
      sql = author ? `SELECT COUNT(*) AS count FROM article WHERE title LIKE ? AND  author_id = ?`:`SELECT COUNT(*) AS count FROM article WHERE title LIKE ?`
      let keywords = `%${keyword}%`
      sqlArr = [keywords,author];
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
 */
getArticle = (req,res) => {
  const {categoryId,labelId,keyword,currentPage,pageSize, author} = req.query;
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
               FROM article,label,category,user 
               WHERE article.label_id = label.label_id AND article.category_id = category.category_id AND article.author_id = user.id AND article.author_id = ? ORDER BY article.id DESC LIMIT ?,?`:
               `SELECT article.*,label.label_name,category.category_name,user.username 
               FROM article,label,category,user 
               WHERE article.label_id = label.label_id AND article.category_id = category.category_id AND article.author_id = user.id ORDER BY article.id DESC LIMIT ?,?`
        sqlArr= author ? [author,currentPage1,pageSize1]:[currentPage1,pageSize1]
      }else {
        sql = author ? `SELECT article.*,label.label_name,category.category_name,user.username  
               FROM article,label,category,user  
               WHERE article.label_id = label.label_id AND article.category_id = category.category_id AND article.author_id = user.id AND article.author_id = ? AND article.label_id = ? ORDER BY article.id DESC LIMIT ?,?`:
               `SELECT article.*,label.label_name,category.category_name,user.username  
               FROM article,label,category,user  
               WHERE article.label_id = label.label_id AND article.category_id = category.category_id AND article.author_id = user.id AND article.label_id = ? ORDER BY article.id DESC LIMIT ?,?`
        sqlArr= author ? [author,labelId1,currentPage1,pageSize1]:[labelId1,currentPage1,pageSize1]
      }
    }else {
      if(!labelId1){
        sql = author ? `SELECT article.*,label.label_name,category.category_name,user.username  
               FROM article,label,category,user   
               WHERE article.label_id = label.label_id AND article.category_id = category.category_id AND article.author_id = user.id AND article.author_id = ? AND article.category_id = ? ORDER BY article.id DESC LIMIT ?,?`:
               `SELECT article.*,label.label_name,category.category_name,user.username  
               FROM article,label,category,user   
               WHERE article.label_id = label.label_id AND article.category_id = category.category_id AND article.author_id = user.id AND article.category_id = ? ORDER BY article.id DESC LIMIT ?,?`
        sqlArr= author ? [author,categoryId1,currentPage1,pageSize1]:[categoryId1,currentPage1,pageSize1]
      }else {
        sql = author ? `SELECT article.*,label.label_name,category.category_name,user.username  
               FROM article,label,category,user  
               WHERE article.label_id = label.label_id AND article.category_id = category.category_id AND article.author_id = user.id AND article.author_id = ? AND article.label_id = ? ORDER BY article.id DESC LIMIT ?,?`:
               `SELECT article.*,label.label_name,category.category_name,user.username  
               FROM article,label,category,user  
               WHERE article.label_id = label.label_id AND article.category_id = category.category_id AND article.author_id = user.id AND article.label_id = ? ORDER BY article.id DESC LIMIT ?,?`
        sqlArr= author ? [author,labelId1,currentPage1,pageSize1]:[labelId1,currentPage1,pageSize1]
      }
    }
  }else {
    sql = author ? `SELECT article.*,label.label_name,category.category_name,user.username  
           FROM article,label,category,user   
           WHERE article.label_id = label.label_id AND article.category_id = category.category_id AND article.author_id = user.id AND article.author_id = ? AND article.title LIKE ? ORDER BY article.id DESC LIMIT ?,?`:
           `SELECT article.*,label.label_name,category.category_name,user.username  
           FROM article,label,category,user   
           WHERE article.label_id = label.label_id AND article.category_id = category.category_id AND article.author_id = user.id AND article.title LIKE ? ORDER BY article.id DESC LIMIT ?,?`
    let keywords = `%${keyword}%`;
    sqlArr = author ? [author,keywords,currentPage1,pageSize1]:[keywords,currentPage1,pageSize1]
  }
  let getArticleCallBack = (err,data) => {
    if(!err){
      data.forEach(item => {
        item.time = Date1.getTime(item.time,"YMD");
      })
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

/** 审核文章
 * 文章字段reviewed
 * 0 : 未审核
 * 1 : 审核通过
 * 2 : 审核不通过
*/ 
reviewedArticle = (req, res) => {
  const { id, status } = req.body
  const sql = 'UPDATE article SET reviewed = ? WHERE id = ?'
  const sqlArr = [status, id]
  let reviewedCallBack = (err) => {
    if (!err) {
      // 审核成功
      return res.json({
        statusCode: 200,
        message: "审核成功"
      });
    } else {
      // 审核失败
      return res.json({
        statusCode: 900,
        message: "出错了，请检查网络设备是否正常!"
      });
    }
  }
  dbConfig.sqlConnect(sql, sqlArr, reviewedCallBack)
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


module.exports = {
  articlePublish,
  getCategory,
  getLabel,
  getArticle,
  getArticlesCount,
  updataArticle,
  reviewedArticle,
  getArticleDetail,
  leaveComment,
  getComment
}