// const { delete } = require("../../app");

module.exports = function(io) {
  let users = {}
  io.on('connection',function(socket) {
    // 用户进入聊天室
    socket.on('login', (id) => {
      console.log(socket.id,'进入了聊天室')
      socket.emit('connection', '成功进入聊天室！')
      socket.name = id
      users[id] = socket.id
    });

    // 用户消息发送
    socket.on('speak', (word,fromid,toid) => {
      console.log(word,fromid,toid);
      console.log('toid',users[toid]);
      socket.to(users[toid]).emit('word',word,fromid)
    }); 
       
    // 用户离开聊天室
    socket.on('disconnecting',() => {
      console.log(socket.id,'离开了聊天室');
      // console.log('删除前users',users);
      if(users.hasOwnProperty(socket.name)) {
        delete users[socket.name]
        // console.log('删除后users',users);
      }
    });
    // socket.on('my other event',function(data) { console.log(data) })
  });
}