import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function sendMessage({message,chatId}){
    const response=await api.post("/chat/message",{message,chatId});
    return response.data;
}   

export async function getChats(){
    const response=await api.get("/chat");
    return response.data;
}

export async function getMessages({chatId}){
    const response=await api.get(`/chat/${chatId}/messages`);
    return response.data;
}

export async function deleteChat({chatId}){
    const response=await api.delete(`/chat/delete/${chatId}`);
    return response.data;
}
