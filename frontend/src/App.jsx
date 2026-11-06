import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ConnectionTestPage from './pages/ConnectionTestPage.jsx';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ConnectionTestPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
