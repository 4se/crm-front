import testDataCars from './testData.json';
import { getBasicAuthHeader } from '../../../auth/AuthContext';

// Простой переключатель между реальными данными API и тестовыми данными для разработки
const USE_TEST_DATA = true; // Переключите на false для использования реального API

export { USE_TEST_DATA };

export const getCarData = async (user) => {
  if (USE_TEST_DATA) {
    // Возвращаем тестовые данные
    return testDataCars;
  }

  // Реальный API запрос
  const headers = { ...getBasicAuthHeader(user) };

  const response = await fetch('https://api.diplom.miray-tech.ru/api/vehicles/', {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
};
