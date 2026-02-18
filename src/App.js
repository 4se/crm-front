import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Layout from './components/Layout';
import Cars from './pages/Cars/Cars';
import Employes from './Employes/Employes.js';
import Buildings from './Buildings/Buildings.js';
import Login from './pages/Auth/Login';
import Account from './pages/Auth/Account';
import { AuthProvider, useAuth } from './auth/AuthContext';

// простой защитник маршрутов
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  return isAuthenticated ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Публичный маршрут для входа */}
            <Route path="/login" element={<Login />} />

            {/* Корневой маршрут - редирект на /cars */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Navigate to="/cars" replace />
                </PrivateRoute>
              }
            />

            {/* Основные маршруты */}
            <Route
              path="/cars"
              element={
                <PrivateRoute>
                  <Cars />
                </PrivateRoute>
              }
            />
            <Route
              path="/employes"
              element={
                <PrivateRoute>
                  <Employes />
                </PrivateRoute>
              }
            />
            <Route
              path="/buildings"
              element={
                <PrivateRoute>
                  <Buildings />
                </PrivateRoute>
              }
            />

            {/* Страница "Мой кабинет" */}
            <Route
              path="/account"
              element={
                <PrivateRoute>
                  <Account />
                </PrivateRoute>
              }
            />

            {/* Запасной маршрут для несуществующих путей */}
            <Route path="*" element={<Navigate to="/cars" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;