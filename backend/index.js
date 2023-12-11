const express = require("express"); // express를 가져온다.
const app = express(); // express를 이용해서 app을 만들어준다.
require('dotenv').config(); 

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { User } = require("./database/models/User.js"); // 모델 스키마 가져오기
const { auth } = require("./middleware/auth.js");
const { mongoose } = require("./database/connect.js");
const { transporter } = require("./config/mailer.js")

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// application/json
app.use(bodyParser.json());
app.use(cookieParser());

app.get("/api/users/", (req, res) => res.send("Hello World! 안녕하세요~"));

app.get("/api/auths/email", (req, res) => {
  var email = req.query.email;
  console.log(email)
  User.findOne(
    {
      email: email,
    },
    (err, user) => {
      if (user) {
        console.error(err)
        return res.json({
          success: false,
          info: null,
          error: {
            message: "이미 가입된 이메일입니다.",
            status: 400
          }
        });
      }else{
        return res.json({
          success: true,
          info: "사용가능한 이메일입니다.",
          status: 200
        });
      }
    }
  )
})

const generateRandom = function() {
  const randomCode = Math.floor(100000 + Math.random() * 900000);
  return randomCode;
}

let randomCode;

app.post("/api/auths/signup", (req, res) => {
  // 회원 가입 할 때 필요한 정보들을 client에서 가져오면 그것들을 데이터베이스에 넣어준다.
  const user = new User(req.body); // body parser를 이용해서 json 형식으로 정보를 가져온다.

  user.save((err, userInfo) => {
    // 몽고디비에서 오는 메소드
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      // status(200)은 성공했다는 뜻
      success: true,
    });
  });
});

app.get("/api/auths/signup/email-send", (req, res) => {
  const user = new User(req.body);
  randomCode = generateRandom();
  let mailOptions = {
    from: process.env.USER, //송신할 이메일
    to: user.email, //수신할 이메일
    subject: "mail test",
    html: randomCode.toString(),
    // attachments: "첨부파일",
  };
  transporter.sendMail(mailOptions)
  return res.json({
    message: "이메일 전송 완료"
  });
})

app.get("/api/auths/signup/email-verification", (req, res) => {
  const userCode = req.body.code;
  
  if(userCode===randomCode){
    return res.json({
      success: true,
      info: "인증되었습니다.",
      status: 200
    });
  }else{
    return res.json({
      success: false,
      info: null,
      error: {
        message: "인증코드가 다릅니다.",
        status: 400
      }
    });
  }

})

app.post("/api/auths/login", (req, res) => {
  // 요청된 이메일을 데이터베이스에 있는지 찾는다.
  User.findOne(
    {
      email: req.body.email,
    },
    (err, user) => {
      if (!user) {
        return res.json({
          loginSuccess: false,
          message: "이메일에 해당하는 유저가 없습니다.",
        });
      }
      // 요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (!isMatch) {
          return res.json({
            loginSuccess: false,
            message: "비밀번호가 틀렸습니다.",
          });
        }
        // 비밀번호까지 맞다면 토큰 생성
        user.generateToken((err, user) => {
          if (err) return res.status(400).send(err);
          // 토큰을 저장한다. 어디에? 쿠키, 로컬스토리지, 세션 등등
          res
            .cookie("x_auth", user.token)
            .status(200)
            .json({ loginSuccess: true, userId: user._id });
        });
      });
    }
  );
});

// auth 미들웨어를 통과해야 다음으로 넘어감
app.get("/api/auths/auth", auth, (req, res) => {
  // 여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 true라는 말
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    // lastname: req.user.lastname,
    // role: req.user.role,
    // image: req.user.image,
  });
});

app.get("/api/auths/logout", auth, (req, res) => {
  console.log(req.user);
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({ success: true });
  });
});

app.get("/api/hello", (req, res) => {
  res.send("안녕하세요~");
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));