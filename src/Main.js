import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import ImagePage from './ImagePage';

export default function Main() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/session/:sessionId" element={<ImagePage />} />
      </Routes>
    </Router>
  );
}
