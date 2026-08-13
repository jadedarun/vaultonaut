import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleAuthProvider } from './context/GoogleAuthContext';
import { BrowserRouter } from 'react-router-dom';
import { KnowledgeProvider } from './context/KnowledgeContext';
import { DocumentProvider } from './context/DocumentContext';
import './index.css';
import App from './App.jsx';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1049489293832-ool2v684u0df5a34cc1jnjeg3t2mv35u.apps.googleusercontent.com';
console.log("Google Client ID:", googleClientId);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <GoogleAuthProvider>
        <BrowserRouter>
          <KnowledgeProvider>
            <DocumentProvider>
              <App />
            </DocumentProvider>
          </KnowledgeProvider>
        </BrowserRouter>
      </GoogleAuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);