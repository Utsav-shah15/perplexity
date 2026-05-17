const express = require("express");
const authRouter = express.Router();
const { register } = require("../controllers/auth.controller.js");

authRouter.post("/register",register)
module.exports=authRouter;