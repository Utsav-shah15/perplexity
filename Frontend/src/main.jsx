import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from "./app/App"
import { store } from './app/app.store'
import "./app/index.css"
import { Provider } from "react-redux";

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <Provider store={store}>
         <App />
     </Provider>
  </StrictMode>,
)
