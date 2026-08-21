import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Intercept fetch to automatically add CORS proxy to all MangaDex requests
const originalFetch = window.fetch;
window.fetch = async function(resource, init) {
  let url = resource;
  if (typeof url === 'string' && url.includes('api.mangadex.org')) {
    
    url = url.replace('http://', 'https://');
    if (!url.includes('corsproxy.io')) {
      url = `https://corsproxy.io/?${url}`;
    }
  }
  return originalFetch(url, init);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)