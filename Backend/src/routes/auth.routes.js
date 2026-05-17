const express = require("express");
const authRouter = express.Router();
const { register, verifyemail } = require("../controllers/auth.controller.js");

authRouter.post("/register",register)

authRouter.get("/verify-email",verifyemail)
module.exports=authRouter;