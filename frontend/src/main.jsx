import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/index.js';
import { ToastProvider } from './context/ToastContext.jsx';
import { AppProvider } from './context/AppContext.jsx';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ToastProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </ToastProvider>
    </Provider>
  </React.StrictMode>
);
