import React from "react";
import {createBrowserRouter,RouterProvider} from "react-router-dom";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import Protected from "../features/auth/component/Protected"
import DashBoard from "../features/chat/pages/DashBoard";
import { Navigate } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element:<Protected><DashBoard/></Protected> ,
  },
  {
    path: "/login",
    element: <Login/>,
  },
  {
    path: "/register",
    element: <Register/>,
  },
  {
    path:"/Dashboard",
    element:<Navigate to="/" replace/>
  }
]);

export default router;

