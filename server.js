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
const User = require('./models/userModel');
const cloudinary = require("cloudinary").v2;


const app = express();
const server = http.createServer(app);
const io = socket(server, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/rideListings', rideListingsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);

app.get('/removeCloudinaryImages', async (req, res)=>{
  try {
    const users = await User.find({}, 'image');
    const cloudinaryIds = users.map(user => {
      if (user.image) {
        const cloudinaryId = cloudinary.url(user.image, { type: 'fetch' }).split('/').slice(-1)[0].split('.')[0];
        return "nustWheelz/" + cloudinaryId;
      }
    }).filter(Boolean);

    // Modify the prefix to include the folder path
    const cloudinaryImages = await cloudinary.api.resources({ type: 'upload', max_results: 500, prefix: 'nustWheelz/' });

    const imagesToDelete = cloudinaryImages.resources.filter(image => !cloudinaryIds.includes(image.public_id));
    for (const image of imagesToDelete) {
      await cloudinary.uploader.destroy(image.public_id);
      console.log(`Deleted image with public ID: ${image.public_id}`);
    }
    res.json({ success: true, message: "Images in 'nustWheelz' folder deleted successfully" });
  } catch (error) {
    res.json({error: error.message, success: false})
  }
})

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