const express = require('express');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const mongoose = require('mongoose');
const app = express();

app.use('/api/auth', authRoutes)

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT,() => {
     console.log(`Running Server on port: ${PORT}`);
      console.log("MongoDB Connected!");
    });
  })
  .catch((err) => {
    console.log(err);
  });
