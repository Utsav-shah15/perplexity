const express=require("express");
const cookieParser=require("cookie-parser");

const app=express();
const authRouter=require("./routes/auth.routes")
const morgan = require("morgan");
const cors=require("cors");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/auth",authRouter);

module.exports=app;