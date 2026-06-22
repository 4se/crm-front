import testDataCars from './testData.json';
import { getBasicAuthHeader } from '../../../auth/AuthContext';
import { CAR_API_ENDPOINTS } from './constantsApi';

// Простой переключатель между реальными данными API и тестовыми данными для разработки
const USE_TEST_DATA = false; // Переключите на true для использования тестовых данных

export { USE_TEST_DATA };

export const getCarData = async (user) => {
  if (USE_TEST_DATA) {
    // Возвращаем тестовые данные
    return testDataCars;
  }

  // Реальный API запрос
  const headers = { ...getBasicAuthHeader(user) };

  const response = await fetch(CAR_API_ENDPOINTS.vehicles, {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
};
