require("dotenv").config();
const app=require("./src/app");
const connectDB=require("./src/config/database");

PORT=process.env.PORT || 3000
connectDB();

app.listen(PORT,()=>{
    console.log("server is listening on 8080");
})