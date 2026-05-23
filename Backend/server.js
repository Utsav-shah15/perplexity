require("dotenv").config();
const app=require("./src/app");
const connectDB=require("./src/config/database");
const http=require("http");
const {initSocket}=require("./src/sockets/server.socket")

PORT=process.env.PORT || 3000
const httpServer=http.createServer(app);
initSocket(httpServer);
connectDB();

httpServer.listen(PORT,()=>{
    console.log("server is listening on 3000");
})