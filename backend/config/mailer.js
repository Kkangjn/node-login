require('dotenv').config(); 
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    service: process.env.email_service,
    secure: false,//port 587의 경우, secure가 false로 유지
    //secure가 false라고 해서 암호화된 연결을 사용하지 않는다는 의미가 아닙니다.
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });

module.exports = { transporter };