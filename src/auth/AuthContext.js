import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (username, password) => {
    // простая авторизация без сервера, в реальном приложении здесь бы вызывался API
    // и проверялись бы переданные учётные данные. Мы просто храним их для
    // формирования заголовка Basic Auth при последующих запросах.
    const avatarUrl = '/logo192.png';
    setUser({ username, password, avatarUrl });
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Вспомогательная функция, возвращающая заголовок Authorization c Basic Auth
 * для переданного пользователя. Можно использовать вне компонента/хука.
 */
export const getBasicAuthHeader = (user) => {
  if (!user?.username || !user?.password) return {};
  return { Authorization: 'Basic ' + btoa(`${user.username}:${user.password}`) };
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
