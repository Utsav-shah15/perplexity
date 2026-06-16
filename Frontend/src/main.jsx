import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from "./app/App"
import { store } from './app/app.store'
import "./app/index.css"
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = "488812095684-doqer678cf2pl6mm3vk726lg3mvstt90.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <App />
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
