const { Router } = require("express");
const router = Router();
const authController = require("../controllers/authController.js");
const { auth } = require("../middleware/auth.js");

router.post("/signup", authController.signup);
router.get("/signup/email", authController.emailCheck);
router.get("/signup/email-send", authController.sendEmailCode);
router.post("/signup/email-verification", authController.emailVerification);
router.post("/login", authController.login);
router.post("/logout", auth, authController.logout);

module.exports = router;
