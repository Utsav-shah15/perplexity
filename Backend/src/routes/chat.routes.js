const { Router } =require("express");
const { sendMessage,getChats,getMessages,deletechat }= require("../controllers/chat.controller");
const chatRouter=Router();
const authUser=require("../middleware/auth.middleware")

chatRouter.post("/message",authUser,sendMessage);
chatRouter.get("/",authUser,getChats);
chatRouter.get("/:chatId/messages",authUser,getMessages);
chatRouter.delete("delete/:chatId",authUser,deletechat);

module.exports=chatRouter;