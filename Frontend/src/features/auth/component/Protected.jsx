import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom';

const Protected = ({children}) => {
  const user=useSelector(state=>state.auth.user);
  const loading=useSelector(state=>state.auth.loading);  

  if(loading){
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">
                Loading...
           </div>
  }
  if(!user){
    return <Navigate to="/login"/>;
  }

  return children;
}

export default Protected
