require('dotenv').config(); 
const mongoose = require("mongoose");
mongoose // 몽구스를 이용해서 mongoDB에 연결
  .connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

  module.exports = { mongoose };