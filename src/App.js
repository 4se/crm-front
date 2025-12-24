import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Layout from './components/Layout';
import Cars from './pages/Cars/Cars';
import Employes from './pages/Employes';
import Buildings from './pages/Buildings';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Корневой маршрут - редирект на /cars */}
          <Route path="/" element={<Navigate to="/cars" replace />} />
          
          {/* Основные маршруты */}
          <Route path="/cars" element={<Cars />} />
          <Route path="/employes" element={<Employes />} />
          <Route path="/buildings" element={<Buildings />} />
          
          {/* Запасной маршрут для несуществующих путей */}
          <Route path="*" element={<Navigate to="/cars" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;