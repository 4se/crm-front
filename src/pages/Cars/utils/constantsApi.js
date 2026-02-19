/**
 * API для загрузки констант (выпадающих списков) с бекэнда
 * В приложении теперь используется HTTP Basic Auth; функции принимают объект
 * пользователя ({username, password}) и формируют заголовок авторизации.
 *
 * URL по умолчанию настроен на api.diplom.miray-tech.ru, но может быть
 * переопределён через переменную окружения REACT_APP_API_URL.
 */

// базовый URL для запросов (если не задан в .env будет реальный сервер)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.diplom.miray-tech.ru/api';

// утилита формирования заголовков с Basic Auth
const makeHeaders = (user) => {
  const headers = { 'Content-Type': 'application/json' };
  if (user?.username && user?.password) {
    headers['Authorization'] = 'Basic ' + btoa(`${user.username}:${user.password}`);
  }
  return headers;
};

/**
 * Загрузить типы ТС с бекэнда
 * @param {Object} user - объект пользователя с username и password
 * @returns {Promise<Array>} Массив типов ТС
 */
export const fetchVehicleTypes = async (user) => {
  try {
    const headers = makeHeaders(user);
    const response = await fetch(`${API_BASE_URL}/vehicle-types`, { headers });
    if (!response.ok) throw new Error('Ошибка загрузки типов ТС');
    const data = await response.json();
    console.log('Ответ сервера для vehicle-types:', data);
    
    // трансформируем структуру (name → value)
    const transformed = Array.isArray(data) 
      ? data.map(item => ({
          id: item.id,
          value: item.name || item.value || ''
        }))
      : [];
    
    return transformed;
  } catch (error) {
    console.error('Ошибка загрузки типов ТС:', error);
    const { VEHICLE_TYPES } = await import('./constants');
    return VEHICLE_TYPES; // fallback на локальные константы
  }
};

/**
 * Загрузить модели ТС с бекэнда
 * @param {Object} user - объект пользователя с username и password
 * @returns {Promise<Array>} Массив моделей ТС
 */
export const fetchVehicleModels = async (user) => {
  try {
    const headers = makeHeaders(user);
    const response = await fetch(`${API_BASE_URL}/vehicle-models`, { headers });
    if (!response.ok) throw new Error('Ошибка загрузки моделей ТС');
    const data = await response.json();
    console.log('Ответ сервера для vehicle-models:', data);
    
    // трансформируем структуру (name → value, brand_name → brand)
    const transformed = Array.isArray(data) 
      ? data.map(item => ({
          id: item.id,
          value: item.name || item.value || '',
          brand: item.brand_name || item.brand || ''
        }))
      : [];
    
    return transformed;
  } catch (error) {
    console.error('Ошибка загрузки моделей ТС:', error);
    const { VEHICLE_MODELS } = await import('./constants');
    return VEHICLE_MODELS; // fallback
  }
};

/**
 * Загрузить локации с бекэнда
 * @param {Object} user - объект пользователя с username и password
 * @returns {Promise<Array>} Массив локаций
 */
export const fetchLocations = async (user) => {
  try {
    // реальный endpoint указан в задании
    const headers = makeHeaders(user);
    const response = await fetch(`${API_BASE_URL}/directories/locations/`, { headers });
    if (!response.ok) throw new Error('Ошибка загрузки локаций');
    const data = await response.json();
    console.log('Ответ сервера для locations:', data);
    
    // трансформируем структуру с сервера (name → value)
    const transformed = Array.isArray(data) 
      ? data.map(item => ({
          id: item.id,
          value: item.name || item.value || item.location_name || ''
        }))
      : [];
    
    return transformed;
  } catch (error) {
    console.error('Ошибка загрузки локаций:', error);
    const { LOCATIONS } = await import('./constants');
    return LOCATIONS;
  }
};

/**
 * Загрузить типы АСПТ с бекэнда
 * @param {Object} user - объект пользователя с username и password
 * @returns {Promise<Array>} Массив типов АСПТ
 */
export const fetchAsptTypes = async (user) => {
  try {
    const headers = makeHeaders(user);
    const response = await fetch(`${API_BASE_URL}/directories/aspt-models/`, { headers });
    if (!response.ok) throw new Error('Ошибка загрузки типов АСПТ');
    const data = await response.json();
    console.log('Ответ сервера для aspt-types:', data);
    
    const transformed = Array.isArray(data) 
      ? data.map(item => ({
          id: item.id,
          value: item.manufacturer+" "+item.name || item.value || ''
        }))
      : [];
    
    return transformed;
  } catch (error) {
    console.error('Ошибка загрузки типов АСПТ:', error);
    const { ASPT_TYPES } = await import('./constants');
    return ASPT_TYPES;
  }
};

/**
 * Загрузить состояния АСПТ с бекэнда
 * @param {Object} user - объект пользователя с username и password
 * @returns {Promise<Array>} Массив состояний АСПТ
 */
export const fetchAsptStates = async (user) => {
  try {
    const headers = makeHeaders(user);
    const response = await fetch(`${API_BASE_URL}/aspt-states`, { headers });
    if (!response.ok) throw new Error('Ошибка загрузки состояний АСПТ');
    const data = await response.json();
    console.log('Ответ сервера для aspt-states:', data);
    
    const transformed = Array.isArray(data) 
      ? data.map(item => ({
          id: item.id,
          value: item.name || item.value || ''
        }))
      : [];
    
    return transformed;
  } catch (error) {
    console.error('Ошибка загрузки состояний АСПТ:', error);
    const { ASPT_STATES } = await import('./constants');
    return ASPT_STATES;
  }
};

/**
 * Загрузить исполнителей с бекэнда
 * @param {Object} user - объект пользователя с username и password
 * @returns {Promise<Array>} Массив исполнителей
 */
export const fetchExecutors = async (user) => {
  try {
    const headers = makeHeaders(user);
    const response = await fetch(`${API_BASE_URL}/executors`, { headers });
    if (!response.ok) throw new Error('Ошибка загрузки исполнителей');
    const data = await response.json();
    console.log('Ответ сервера для executors:', data);
    
    const transformed = Array.isArray(data) 
      ? data.map(item => ({
          id: item.id,
          value: item.name || item.value || ''
        }))
      : [];
    
    return transformed;
  } catch (error) {
    console.error('Ошибка загрузки исполнителей:', error);
    const { EXECUTORS } = await import('./constants');
    return EXECUTORS;
  }
};

/**
 * Загрузить все константы одновременно
 * @param {Object} user - объект пользователя с username и password
 * @returns {Promise<Object>} Объект со всеми константами
 */
export const fetchAllConstants = async (user) => {
  try {
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
