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

        const token = user?.token || localStorage.getItem('authToken');

        const [
          vehicleTypes,
          vehicleModels,
          locations,
          asptTypes,
          asptStates,
          executors
        ] = await Promise.all([
          fetchVehicleTypes(token),
          fetchVehicleModels(token),
          fetchLocations(token),
          fetchAsptTypes(token),
          fetchAsptStates(token),
          fetchExecutors(token)
        ]);

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
