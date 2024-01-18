const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const socket = require('socket.io');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const rideListingsRoutes = require('./routes/rideListingsRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const server = http.createServer(app);
const io = socket(server, {
  cors: {
    origin: '*',
    credentials: true,
  },
});


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/rideListings', rideListingsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(PORT,() => {
     console.log(`Running Server on port: ${PORT}`);
      console.log("MongoDB Connected!");
    });
  })
  .catch((err) => {
    console.log(err);
  });


  // global.onlineUsers = new Map();
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