
import { createRoot } from 'react-dom/client'
import { GradientProvider } from './context/GradientContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  
    
    <GradientProvider>
    <App />
    </GradientProvider>
    
 ,
);
