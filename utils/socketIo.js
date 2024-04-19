const initializeSocketIo = (io) => {
  io.on("connection", (socket) => {
    socket.on("join-room", (listingId) => {
      socket.join(listingId); 
    });

    socket.on("leave-room", (listingId) => {
      socket.leave(listingId); 
    });

    socket.on("send-msg", (data) => {
      // Broadcast the message to all users in the room except the sender
      socket.broadcast.to(data.listingId).emit("msg-recieve", data);
    });
  });
};

module.exports = {
  initializeSocketIo,
};
