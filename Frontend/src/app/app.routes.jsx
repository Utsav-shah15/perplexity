import React from "react";
import {createBrowserRouter,RouterProvider} from "react-router-dom";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import Protected from "../features/auth/component/Protected"

const router = createBrowserRouter([
  {
    path: "/",
    element:<Protected><h1>Home</h1></Protected> ,
  },
  {
    path: "/login",
    element: <Login/>,
  },
  {
    path: "/register",
    element: <Register/>,
  },
]);

export default router;

