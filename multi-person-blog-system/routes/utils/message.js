var dbConfig = require('../../serve/dbConfig')

async function addMessage(sqlArr) {
  return new Promise((resolve,reject) => {
    const sqlStr = 'INSERT INTO message(type_name,author_id,initiator_id,goal_id, describes, TIME, goal_type) VALUES(?, ?, ?, ?, ?, ?, ?)'
    const addMessageCallBack = err => {
      if(err) {
        reject('消息添加失败');
      }else {
        resolve('消息添加成功');
      }
    }
    dbConfig.sqlConnect(sqlStr, sqlArr,addMessageCallBack)
  })
}

// function getAuthorId(id,target) {
//   const sqlStr2 = 'INSERT INTO message(type_name,author_id,initiator_id,goal_id, describes, TIME, goal_type) VALUES(?, ?, ?, ?, ?, ?, ?)'
//   const sqlArray2 = [id]
//   const addMessageCallBack = err => {
//     if(err) {
//       console.log('消息添加失败');
//     }else {
//       console.log('消息添加成功');
//     }
//   }
//   dbConfig.sqlConnect(sqlStr, sqlArr,addMessageCallBack)
// }

// 获取目标ID
// function getTargetId(id,type) {
//   const sqlStr3 = 'SELECT type_num AS type FROM COMMENT WHERE id = ?'
//   const sqlArray3 = [id]
//   const getTargetTypeCallBack = (err,data) => {
//     if(err) {
//       console.log('获取目标ID失败');
//     }else {
//       return data[0].type
//     }
//   }
//   dbConfig.sqlConnect(sqlStr3, sqlArray3,getTargetTypeCallBack)
// }

// 获取评论的目标类型
async function getTargetType(id) {
  return new Promise((resolve,reject) => {
    const sqlStr3 = 'SELECT type_num AS type, parent_id AS targetId FROM COMMENT WHERE id = ?'
    const sqlArray3 = [id]
    const getTargetTypeCallBack = (err,data) => {
      if(err) {
        reject('获取评论的目标类型失败');
      }else {
        resolve(data[0])
      }
    }
    dbConfig.sqlConnect(sqlStr3, sqlArray3,getTargetTypeCallBack)
  })
}

// 获取评论的目标作者
function getTargetAuthor(id,type) {
  return new Promise((resolve,reject) => {
    let sqlStr4 = type === 1 ? 'SELECT author_id FROM article WHERE id = ?' : 'SELECT author_id FROM question WHERE id = ?'
    const sqlArray4 = [id]
    const getTargetAuthorCallBack = (err,data) => {
      if(err) {
        reject('获取评论的目标作者失败');
      }else {
        resolve(data[0].author_id)
      }
    }
    dbConfig.sqlConnect(sqlStr4, sqlArray4,getTargetAuthorCallBack)
  })
}



module.exports = {addMessage,getTargetType,getTargetAuthor}