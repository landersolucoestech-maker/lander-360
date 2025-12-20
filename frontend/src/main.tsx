import { createRoot } from 'react-dom/client'
import { ThemeProvider } from "next-themes";
import App from './App.tsx'
import './index.css'

// Import admin creation script in development
if (import.meta.env.DEV) {
  console.log('Development mode - manual admin creation available');
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    attribute="class"
    defaultTheme="light"
    enableSystem
    storageKey="vite-ui-theme"
  >
    <App />
  </ThemeProvider>
);
