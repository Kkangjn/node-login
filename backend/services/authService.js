const express = require("express"); // express를 가져온다.
const app = express(); // express를 이용해서 app을 만들어준다.
require('dotenv').config(); 
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { User } = require("../database/models/User.js"); // 모델 스키마 가져오기
const { auth } = require("../middleware/auth.js");
const { mongoose } = require("../database/connect.js");
const { transporter } = require("../config/mailer.js")

const signup = async (requsetSignup) => {

  try {
    const user = new User(requsetSignup);
    const userInfo = await user.save(); // user.save()는 Promise를 반환하므로 await 사용

    // 오류 발생 시 에러 처리
    if (!userInfo) {
      return {
        success: false,
        info: null,
        status: 400,
      };
    }

    return {
      success: true,
      info: '회원가입 성공',
      status: 200,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      info: null,
      status: 500, // 서버 오류 등의 상황에서 적절한 상태 코드 반환
    };
  }
}

const emailCheck = async (email) => {
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
}

const generateRandom = function() {
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    return randomCode;
}
  
let randomCode;

const sendEmailCode = async (requsetSendEmailCode) => {
    const email = requsetSendEmailCode.email;
    randomCode = generateRandom();
    let mailOptions = {
        from: process.env.USER, //송신할 이메일
        to: email, //수신할 이메일
        subject: "mail test",
        html: randomCode.toString(),
        // attachments: "첨부파일",
    };
    try {
        transporter.sendMail(mailOptions)

        return {
            success:true,
            info: "이메일 전송 완료",
            status: 200
        };
    } catch (err) {
        return {
            success:false,
            info: null,
            status: 400
        };
    }
}

const emailVerification = async (requsetVerificateCode) => {
    const userCode = requsetVerificateCode.code;

    if(userCode===randomCode){
        return {
            success: true,
            info: "인증되었습니다.",
            status: 200
    };
    }else{
        return {
            success: false,
            info: null,
            error: {
                message: "인증코드가 다릅니다.",
                status: 400
            }
        };
    }

}

const login = async (requsetLogin, res) => {
    try {
        const user = await User.findOne({ email: requsetLogin.email });
        
        if (!user) {
            return {
                success: false,
                info: null,
                error: {
                    message: "이메일에 해당하는 유저가 없습니다.",
                    status: 400
                }
            };
        }

        const isMatch = await comparePassword(requsetLogin.password, user);
        
        if (!isMatch) {
            return {
                success: false,
                info: null,
                error: {
                    message: "비밀번호가 일치하지 않습니다.",
                    status: 400
                }
            };
        }

        const token = await generateToken(user);

        if (!token) {
            return {
                success: false,
                info: null,
                error: {
                    message: "토큰 생성에 실패했습니다.",
                    status: 400
                }
            };
        }
        

        res.cookie("x_auth", token)
        
        return {
            success: true,
            info: "인증되었습니다.",
            status: 200
        };
    }catch{
        return {
            success: false,
                info: null,
                error: {
                    message: "로그인에 실패했습니다.",
                    status: 400
                }
        };
    };
}

const logout = async (user, res) => {
    console.log(user);
    User.findOneAndUpdate({ _id: user._id }, { token: "" }, (err, userInfo) => {
        if (err) return { success: false,
            info: null,
            error: {
                message: "로그아웃 실패",
                status: 400
            }
        };
        return {
            success: true,
            info: "로그아웃 성공",
            status: 200
        };
    });
}

const comparePassword = function(password, user) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, function(err, isMatch) {
            if (err) reject(err);
            resolve(isMatch);
        });
    });
};

const generateToken = function(user) {
    // jsonwebtoken을 이용해서 token을 생성하기
    const token = jwt.sign(user._id.toHexString(), process.env.SECRET_KEY);
    user.token = token;
    const userInfo = user.save(); // user.save()는 Promise를 반환하므로 await 사용

    // 오류 발생 시 에러 처리
    if (!userInfo) {
      return {
        success: false,
        info: null,
        status: 400,
      };
    }
    
    return token
}

module.exports = { signup, sendEmailCode, emailCheck, emailVerification, login, logout};