import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import admin creation script in development
if (import.meta.env.DEV) {
  console.log('Development mode - manual admin creation available');
}

createRoot(document.getElementById("root")!).render(<App />);
