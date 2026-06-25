import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LocationProvider } from './context/LocationContext.tsx'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './queryClient.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <LocationProvider>
        <App />
      </LocationProvider>
    </QueryClientProvider>
  </StrictMode>,
)
