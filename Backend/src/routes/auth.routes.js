const express = require("express");
const authRouter = express.Router();
const {
  register,
  verifyemail,
  login,
  logout,
  getMe,
  resendVerificationEmail,
  googleAuth,
  googleCallback
} = require("../controllers/auth.controller.js");
const authUser = require("../middleware/auth.middleware.js");

authRouter.post("/register", register);
authRouter.get("/verify-email", verifyemail);
authRouter.post("/resend-verification", resendVerificationEmail);
authRouter.post("/login", login);
authRouter.get("/get-me", authUser, getMe);
authRouter.post("/logout", logout);
authRouter.get("/google", googleAuth);
authRouter.get("/google/callback", googleCallback);

module.exports = authRouter;