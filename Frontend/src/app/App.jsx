import React from 'react'
import router from "./app.routes"
import { RouterProvider } from 'react-router-dom'
import { useAuth } from '../features/auth/hook/useAuth'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setLoading } from '../features/auth/authSlice'

const App = () => {
  const {handleGetMe}=useAuth();
  const dispatch=useDispatch();

  useEffect(() => {

      async function loadUser(){
          try{
            await handleGetMe();
          } catch(err){
            console.log(err);
          } finally{
            dispatch(setLoading(false));
          }
      }

      loadUser();
  }, []);

  return <RouterProvider router={router}/>;
}

export default App
