import { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/AuthContext';
import {
  fetchVehicleTypes,
  fetchVehicleModels,
  fetchLocations,
  fetchAsptTypes,
  fetchAsptStates,
  fetchExecutors
} from '../utils/constantsApi';

/**
 * Custom hook для загрузки констант (выпадающих списков)
 * Автоматически загружает константы при монтировании компонента
 * и переступить на локальные константы если происходит ошибка
 */
export const useConstants = () => {
  const { user } = useAuth();
  const [constants, setConstants] = useState({
    vehicleTypes: [],
    vehicleModels: [],
    locations: [],
    asptTypes: [],
    asptStates: [],
    executors: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadConstants = async () => {
      try {
        setLoading(true);
        setError(null);

        // передаём объект пользователя в API-методы; заголовки будут
        // сформированы внутри, если учётные данные присутствуют
        const [
          vehicleTypes,
          vehicleModels,
          locations,
          asptTypes,
          asptStates,
          executors
        ] = await Promise.all([
          fetchVehicleTypes(user),
          fetchVehicleModels(user),
          fetchLocations(user),
          fetchAsptTypes(user),
          fetchAsptStates(user),
          fetchExecutors(user)
        ]);

        console.log('Загруженные константы с сервера:', {
          vehicleTypes,
          vehicleModels,
          locations,
          asptTypes,
          asptStates,
          executors
        });

        setConstants({
          vehicleTypes,
          vehicleModels,
          locations,
          asptTypes,
          asptStates,
          executors
        });
      } catch (err) {
        console.error('Ошибка загрузки констант:', err);
        setError(err.message);
        // константы остаются с локальными значениями из fallback в constantsApi
      } finally {
        setLoading(false);
      }
    };

    loadConstants();
  }, [user]);

  return {
    ...constants,
    loading,
    error
  };
};
