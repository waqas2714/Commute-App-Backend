// global.onlineUsers = new Map();
const initializeSocketIo = (io)=>{
  io.on("connection", (socket) => {
    global.chatSocket = socket;
    // socket.on("add-user", (userId) => {
    //   onlineUsers.set(userId, socket.id);
    // });
  
    socket.on("send-msg", (data) => {
      // const sendUserSocket = onlineUsers.get(data.to);
      // if (sendUserSocket) {
        socket
        .broadcast.emit("msg-recieve", data.msg);
        // .to(sendUserSocket)
      // }
    });
  });
}

module.exports = {
    initializeSocketIo
}