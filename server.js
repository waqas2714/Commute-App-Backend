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
const cronjobsRoutes = require('./routes/cronjobs');
const User = require('./models/userModel');
const { initializeSocketIo } = require('./utils/socketIo');
const cloudinary = require("cloudinary").v2;
const path = require('path');


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
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/rideListings', rideListingsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);
app.use('/cron', cronjobsRoutes);

app.get("/", (req, res)=>{
  res.send("I am alive :)");
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


initializeSocketIo(io);