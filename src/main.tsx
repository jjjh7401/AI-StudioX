import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { initializeClient } from './services/geminiService'

// VITE_GEMINI_API_KEY가 설정된 경우 자동 초기화 (나노바나나2 + Veo 3 Fast 사용)
const envApiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
if (envApiKey) {
  initializeClient(envApiKey)
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
