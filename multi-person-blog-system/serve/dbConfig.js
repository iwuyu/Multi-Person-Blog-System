const mysql = require('mysql')
module.exports = {
  config: {
    host: 'localhost', // 数据库的主机地址
    port: '3306', // 端口号
    user: 'root',
    password: '123456',
    database: 'multi_person_blog'
    // multi_person_blog
  },
  // 链接数据库，使用mysql连接池的方式
  // 连接池对象
  sqlConnect:function(sql,sqlArr,callback) {
    var pool = mysql.createPool(this.config)
    pool.getConnection((err,conn) => {
      if(err) {
        console.log('链接失败,请重新链接！');
        // return
        sqlConnect(sql,sqlArr,callback)
      }
      // 事件驱动回调
      conn.query(sql,sqlArr,callback);
      // 释放链接
      conn.release();
    })
  }
}