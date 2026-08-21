import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

const originalFetch = window.fetch;
window.fetch = async function(resource, init) {
  let url = resource;
  if (typeof url === 'string' && url.includes('api.mangadex.org')) {
    url = url.replace('http://', 'https://');
    if (!url.includes('codetabs.com')) {
     
      url = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;
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