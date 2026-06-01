import { initializeSocketConnection, getSocket } from "../services/chat.socket";
import { sendMessage,getChats,getMessages,deleteChat} from "../services/chat.api";
import { useDispatch, useSelector } from "react-redux";
import { setChats,setCurrentChatId,setIsError,setLoading,createNewChat,addNewMessage,setMessages,deleteChatFromState } from "../chat.slice";

export const useChat=()=>{
    const dispatch = useDispatch();
    const { currentChatId } = useSelector((state) => state.chat);

    function handleInitializeSocket(){
        initializeSocketConnection(dispatch);
    }

    async function handlechatMessage({message,chatId}){
        try{
            if (chatId) {
                // Optimistically add user message to the active chat
                dispatch(addNewMessage({
                    chatId,
                    message: {
                        role: "user",
                        content: message,
                        createdAt: new Date().toISOString()
                    }
                }));
            } else {
                // Optimistically create a temporary chat and add user message
                dispatch(createNewChat({ chatId: "temp-chat", title: "New Chat..." }));
                dispatch(addNewMessage({
                    chatId: "temp-chat",
                    message: {
                        role: "user",
                        content: message,
                        createdAt: new Date().toISOString()
                    }
                }));
            }
            dispatch(setLoading(true));

            const socket = getSocket();
            console.log("Socket status in hook:", socket ? { connected: socket.connected, id: socket.id } : "null");

            if (socket && socket.connected) {
                socket.emit("sendMessage", { message, chatId });
            } else {
                const data=await sendMessage({message,chatId});
                const {chat,aimessage,usermessage,title}=data;
                if (!chatId) {
                    // For a new chat, create it, add both messages from server, then clean up temp-chat
                    dispatch(createNewChat({chatId:chat._id,title}));
                    dispatch(addNewMessage({chatId:chat._id,message:usermessage}));
                    dispatch(addNewMessage({chatId:chat._id,message:aimessage}));
                    dispatch(deleteChatFromState("temp-chat"));
                } else {
                    // For existing chat, just add the AI message
                    dispatch(addNewMessage({chatId: chatId, message: aimessage}));
                }
                dispatch(setLoading(false));
            }
        }catch(error){
            dispatch(setIsError(true));
            if (!chatId) {
                dispatch(deleteChatFromState("temp-chat"));
                dispatch(setCurrentChatId(null));
            }
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
            const data=await getMessages({chatId});
            const {messages}=data;
            dispatch(setMessages({chatId,messages}));
        }catch(error){
            dispatch(setIsError(true));
        }finally{
            dispatch(setLoading(false));
        }
    }    

    async function handleDeleteChat(chatId){
        try{
            dispatch(setLoading(true));
            await deleteChat({chatId});
            dispatch(deleteChatFromState(chatId));
            if (currentChatId === chatId) {
                dispatch(setCurrentChatId(null));
            }
        }
        catch(error){
            dispatch(setIsError(true));
        }
        finally{
            dispatch(setLoading(false));
        }
    }

    return {
        initializeSocketConnection: handleInitializeSocket,
        handlechatMessage,
        handleGetChats,
        handleGetMessages,
        handleDeleteChat
    }
}
