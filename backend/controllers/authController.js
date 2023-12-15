const authService = require("../services/authService.js");

const signup = async (req, res) => {
    const requsetSignup = req.body;

    try {
    const { success, info, status } =
      await authService.signup(requsetSignup);

    // 오류 처리?
    if (success == false) return console.error("generate Err");

    res.status(200).json({ success, info, status });
  } catch (err) {
    console.error(err);
  }
};

const emailCheck = async (req, res) => {
    const requestCheckEmail = req.query.email;
    try {
        const { success, info, status } =
            await authService.emailCheck(requestCheckEmail);
    
        if (success == false) return console.error("generate Err");

        res.status(200).json({ success, info, status });
    } catch (err) {
        console.error(err);
    }
}

const sendEmailCode = async (req, res) => {
    const requsetSendEmailCode = req.body;
    try {
        const { success, info, status } =
            await authService.sendEmailCode(requsetSendEmailCode);
    
        if (success == false) return console.error("generate Err");

        res.status(200).json({ success, info, status });
    } catch (err) {
        console.error(err);
    }
}

const emailVerification = async (req, res) => {
    const requsetVerificateCode = req.body;

    try {
        const { success, info, status } =
            await authService.emailVerification(requsetVerificateCode);
    
        if (success == false) return console.error("generate Err");

        res.status(200).json({ success, info, status });
    } catch (err) {
        console.error(err);
    }
}

const login = async (req, res) => {
    const requsetLogin = req.body;

    try {
    const { success, info, status, error } =
      await authService.login(requsetLogin, res);

    if (success == false) return console.error("generate Err", error);

    res.status(200).json({ success, info, status });
  } catch (err) {
    console.error(err);
  }
}

const logout = async (req, res) => {
    const user = req.user;

    try {
    const { success, info, status, error } =
      await authService.logout(user, res);

    if (success == false) return console.error("generate Err", error);

    res.status(200).json({ success, info, status });
  } catch (err) {
    console.error(err);
  }
}



module.exports = { signup, sendEmailCode, emailCheck, emailVerification, login, logout};
