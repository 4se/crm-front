/**
 * API для загрузки констант (выпадающих списков) с бекэнда
 * На будущее: замени эти функции на реальные API запросы к серверу
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Загрузить типы ТС с бекэнда
 * @param {string} token - JWT токен для авторизации
 * @returns {Promise<Array>} Массив типов ТС
 */
export const fetchVehicleTypes = async (token) => {
  try {
    // TODO: Заменить на реальный API запрос
    // const response = await fetch(`${API_BASE_URL}/vehicle-types`, {
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json'
    //   }
    // });
    // return await response.json();
    
    // На данный момент возвращаем локальные константы
    const { VEHICLE_TYPES } = await import('./constants');
    return VEHICLE_TYPES;
  } catch (error) {
    console.error('Ошибка загрузки типов ТС:', error);
    const { VEHICLE_TYPES } = await import('./constants');
    return VEHICLE_TYPES; // fallback на локальные константы
  }
};

/**
 * Загрузить модели ТС с бекэнда
 * @param {string} token - JWT токен для авторизации
 * @returns {Promise<Array>} Массив моделей ТС
 */
export const fetchVehicleModels = async (token) => {
  try {
    // TODO: Заменить на реальный API запрос
    // const response = await fetch(`${API_BASE_URL}/vehicle-models`, {
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json'
    //   }
    // });
    // return await response.json();
    
    const { VEHICLE_MODELS } = await import('./constants');
    return VEHICLE_MODELS;
  } catch (error) {
    console.error('Ошибка загрузки моделей ТС:', error);
    const { VEHICLE_MODELS } = await import('./constants');
    return VEHICLE_MODELS; // fallback
  }
};

/**
 * Загрузить локации с бекэнда
 * @param {string} token - JWT токен для авторизации
 * @returns {Promise<Array>} Массив локаций
 */
export const fetchLocations = async (token) => {
  try {
    // TODO: Заменить на реальный API запрос
    // const response = await fetch(`${API_BASE_URL}/locations`, {
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json'
    //   }
    // });
    // return await response.json();
    
    const { LOCATIONS } = await import('./constants');
    return LOCATIONS;
  } catch (error) {
    console.error('Ошибка загрузки локаций:', error);
    const { LOCATIONS } = await import('./constants');
    return LOCATIONS;
  }
};

/**
 * Загрузить типы АСПТ с бекэнда
 * @param {string} token - JWT токен для авторизации
 * @returns {Promise<Array>} Массив типов АСПТ
 */
export const fetchAsptTypes = async (token) => {
  try {
    // TODO: Заменить на реальный API запрос
    // const response = await fetch(`${API_BASE_URL}/aspt-types`, {
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json'
    //   }
    // });
    // return await response.json();
    
    const { ASPT_TYPES } = await import('./constants');
    return ASPT_TYPES;
  } catch (error) {
    console.error('Ошибка загрузки типов АСПТ:', error);
    const { ASPT_TYPES } = await import('./constants');
    return ASPT_TYPES;
  }
};

/**
 * Загрузить состояния АСПТ с бекэнда
 * @param {string} token - JWT токен для авторизации
 * @returns {Promise<Array>} Массив состояний АСПТ
 */
export const fetchAsptStates = async (token) => {
  try {
    // TODO: Заменить на реальный API запрос
    // const response = await fetch(`${API_BASE_URL}/aspt-states`, {
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json'
    //   }
    // });
    // return await response.json();
    
    const { ASPT_STATES } = await import('./constants');
    return ASPT_STATES;
  } catch (error) {
    console.error('Ошибка загрузки состояний АСПТ:', error);
    const { ASPT_STATES } = await import('./constants');
    return ASPT_STATES;
  }
};

/**
 * Загрузить исполнителей с бекэнда
 * @param {string} token - JWT токен для авторизации
 * @returns {Promise<Array>} Массив исполнителей
 */
export const fetchExecutors = async (token) => {
  try {
    // TODO: Заменить на реальный API запрос
    // const response = await fetch(`${API_BASE_URL}/executors`, {
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json'
    //   }
    // });
    // return await response.json();
    
    const { EXECUTORS } = await import('./constants');
    return EXECUTORS;
  } catch (error) {
    console.error('Ошибка загрузки исполнителей:', error);
    const { EXECUTORS } = await import('./constants');
    return EXECUTORS;
  }
};

/**
 * Загрузить все константы одновременно
 * @param {string} token - JWT токен для авторизации
 * @returns {Promise<Object>} Объект со всеми константами
 */
export const fetchAllConstants = async (token) => {
  try {
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

    return {
      vehicleTypes,
      vehicleModels,
      locations,
      asptTypes,
      asptStates,
      executors
    };
  } catch (error) {
    console.error('Ошибка загрузки констант:', error);
    // вернём локальные константы как fallback
    const {
      VEHICLE_TYPES,
      VEHICLE_MODELS,
      LOCATIONS,
      ASPT_TYPES,
      ASPT_STATES,
      EXECUTORS
    } = await import('./constants');
    
    return {
      vehicleTypes: VEHICLE_TYPES,
      vehicleModels: VEHICLE_MODELS,
      locations: LOCATIONS,
      asptTypes: ASPT_TYPES,
      asptStates: ASPT_STATES,
      executors: EXECUTORS
    };
  }
};
