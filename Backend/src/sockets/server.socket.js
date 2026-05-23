const {Server}=require("socket.io")

let io;

function initSocket(httpServer){
    io=new Server(httpServer,{
        cors:{
            origin:"http://localhost:5173",
            credentials:true
        }
    })

    console.log("socket.io server is running");

    io.on("connection",(socket)=>{
        console.log("A user connected:"+socket.id)
    })
}

function getIO(){
    if(!io){
        throw new Error("socket.io is not initialized");
    }

    return io;
}

module.exports={
    initSocket,
    getIO
}