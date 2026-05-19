import { useDispatch } from "react-redux";
import {register,login,getMe} from "../services/auth.api"
import { setUser,setError,setLoading } from "../authSlice";

export function useAuth(){
    const dispatch = useDispatch();

    async function handleRegister({email,username,password}){
        try{
            dispatch(setLoading(true));
            const data=await register({email,username,password});
        }catch(err){
            dispatch(setError(err.response?.data?.message || "Registration failed"))
        }finally{
            dispatch(setLoading(false));
        }
    }

    async function handleLogin({email,password}){
        try{
            dispatch(setLoading(true));
            const data=await login({email,password});
            dispatch(setUser(data.user))
        }catch(err){
            dispatch(setError(err.response?.data?.message || "Login failed"))
        }finally{
            dispatch(setLoading(false));
        }
    }

    async function handleGetMe(){
        try{
            dispatch(setLoading(true));
            const data=await getMe();
            dispatch(setUser(data.user))
        }catch(err){
            dispatch(setError(err.response?.data?.message || "failed to fetch data"))
        }finally{
            dispatch(setLoading(false));
        }
    }

    return {
        handleRegister,
        handleLogin,
        handleGetMe
    }
}