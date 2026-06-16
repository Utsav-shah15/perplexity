import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function register({email,password,username}){
    const response=await api.post("auth/register",{email,username,password});
    return response.data;
}

export async function login({email,password}){
    const response=await api.post("auth/login",{email,password});
    return response.data;
}

export async function getMe(){
    const response=await api.get("auth/get-me");
    return response.data;
}

export async function logout(){
    const response=await api.post("auth/logout");
    return response.data;
}

export async function googleLogin({ credential, profile }) {
    const response = await api.post("auth/google", { credential, profile });
    return response.data;
}