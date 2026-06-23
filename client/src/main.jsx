import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

console.log('📦 main.jsx chargé');

// ⚠️ TEMPORAIRE: Retirer StrictMode pour debug
createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>
);