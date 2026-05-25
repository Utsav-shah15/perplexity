import { initializeSocketConnection } from "../services/chat.socket";
import { sendMessage,getChats,getMessages,deleteChat} from "../services/chat.api";
import { useDispatch } from "react-redux";
import { setChats,setCurrentChatId,setIsError,setLoading,createNewChat,addNewMessage,setMessages } from "../chat.slice";

export const useChat=()=>{
    const dispatch = useDispatch();

    async function handlechatMessage({message,chatId}){
        try{
            dispatch(setLoading(true));
            const data=await sendMessage({message,chatId});
            const {chat,aimessage,usermessage,title}=data;
            dispatch(createNewChat({chatId:chat._id,title}));
            dispatch(setCurrentChatId(chat?._id || chatId));
            dispatch(addNewMessage({chatId:chat._id,message:usermessage}));
            dispatch(addNewMessage({chatId:chat._id,message:aimessage}));
        }catch(error){
            dispatch(setIsError(true));
        }finally{
            dispatch(setLoading(false));
        }   
    }

    async function handleGetChats(){
        try{
            dispatch(setLoading(true));
            const data=await getChats();
            const {chats}=data;
            console.log(chats);
            dispatch(setChats(chats.reduce((acc,chat)=>{
                acc[chat._id]={
                    id:chat._id,
                    title:chat.title,
                    messages:[],
                    lastUpdated:chat.updatedAt
                }
                return acc;
        },{})));
        }catch(error){
            dispatch(setIsError(true));
        }finally{
            dispatch(setLoading(false));
        }
    }

    async function handleGetMessages(chatId){
        try{
            dispatch(setLoading(true));
            const data=await getMessages(chatId);
            const {messages}=data;
            dispatch(setMessages({chatId,messages}));
        }catch(error){
            dispatch(setIsError(true));
        }finally{
            dispatch(setLoading(false));
        }
    }    

    return {
        initializeSocketConnection,
        handlechatMessage,
        handleGetChats,
        handleGetMessages
    }
}
