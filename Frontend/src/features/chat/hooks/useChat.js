import { initializeSocketConnection } from "../services/chat.socket";
import { sendMessage,getChats,getMessages,deleteChat} from "../services/chat.api";
import { useDispatch } from "react-redux";
import { setChats,currentChatId,isError,isLoading } from "../chat.slice";

export const useChat=()=>{
    const dispatch = useDispatch();

    async function handlechatMessage({message,chatId}){
        try{
            dispatch(isLoading(true));
            const data=await sendMessage({message,chatId});
            const {chat,aimessage,title}=data;
            dispatch(setChats((prev)=>{
                return {
                    ...prev,
                    [chat._id || chatId]:{
                        ...chat,
                        messages:[{content:message,role:"user"},aimessage]
                    }
                }
            }))
            dispatch(currentChatId(chat?._id || chatId));
        }catch(error){
            dispatch(isError(true));
        }finally{
            dispatch(isLoading(false));
        }   
    }

    return {
        initializeSocketConnection,
        handlechatMessage
    }
}
