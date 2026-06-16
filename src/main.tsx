import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.tsx'
import { LocationProvider } from './context/LocationContext.tsx'

axios.defaults.headers.common['ngrok-skip-browser-warning'] = '69420';
axios.defaults.headers.common['X-Tunnel-Skip-AntiPhishing-Page'] = 'true';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocationProvider>
      <App />
    </LocationProvider>
  </StrictMode>,
)
