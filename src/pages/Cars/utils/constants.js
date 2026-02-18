/**
 * Локальные константы для выпадающих списков
 * 
 * На будущее: эти константы будут загружаться с бекэнда через constantsApi.js
 * Используйте useConstants hook для автоматической загрузки констант с fallback на локальные значения
 * 
 * Пример использования:
 * 
 * import { useConstants } from '../hooks/useConstants';
 * 
 * function MyComponent() {
 *   const { vehicleTypes, locations, asptTypes, asptStates, executors, loading } = useConstants();
 *   
 *   if (loading) return <Spinner />;
 *   
 *   return (
 *     <Form.Select>
 *       {vehicleTypes.map(item => (
 *         <option key={item.id} value={item.value}>{item.value}</option>
 *       ))}
 *     </Form.Select>
 *   );
 * }
 */

export const CAR_STATUSES = [
  'Исправна',
  'Требует проверки',
  'На регулировке',
  'Неисправна'
];

/**
 * Типы транспортных средств
 * API endpoint: GET /api/vehicle-types
 */
export const VEHICLE_TYPES = [
  { id: 1, value: 'Грузовик' },
  { id: 2, value: 'Легковой' },
  { id: 3, value: 'Микроавтобус' },
  { id: 4, value: 'Спецтехника' },
  { id: 5, value: 'Мотоцикл' }
];

/**
 * Модели транспортных средств (с указанием бренда)
 * API endpoint: GET /api/vehicle-models
 */
export const VEHICLE_MODELS = [
  // Грузовики
  { id: 1, brand: 'Volvo', value: 'FH16' },
  { id: 2, brand: 'Volvo', value: 'FM' },
  { id: 3, brand: 'Scania', value: 'R440' },
  { id: 4, brand: 'Scania', value: 'G440' },
  { id: 5, brand: 'MAN', value: 'TGX' },
  { id: 6, brand: 'Kamaz', value: '6520' },
  
  // Легковые
  { id: 7, brand: 'BMW', value: 'X5' },
  { id: 8, brand: 'BMW', value: '5 Series' },
  { id: 9, brand: 'Mercedes', value: 'C-Class' },
  { id: 10, brand: 'Mercedes', value: 'E-Class' },
  { id: 11, brand: 'Audi', value: 'A6' },
  { id: 12, brand: 'Volkswagen', value: 'Passat' },
  
  // Микроавтобусы
  { id: 13, brand: 'Mercedes', value: 'Sprinter' },
  { id: 14, brand: 'Mercedes', value: 'Vito' },
  { id: 15, brand: 'Ford', value: 'Transit' },
  { id: 16, brand: 'Hyundai', value: 'H350' },
  { id: 17, brand: 'Iveco', value: 'Daily' },
  
  // Спецтехника
  { id: 18, brand: 'CAT', value: '320' },
  { id: 19, brand: 'Komatsu', value: 'PC200' },
  { id: 20, brand: 'JCB', value: '3CX' }
];

export const REQUEST_TYPES = [
  'Техническое обслуживание',
  'Ремонт',
  'Диагностика',
  'Плановый ремонт',
  'Аварийный ремонт'
];

/**
 * Локации (места нахождения транспорта)
 * API endpoint: GET /api/locations
 */
export const LOCATIONS = [
  { id: 1, value: 'Гараж 1' },
  { id: 2, value: 'Гараж 2' },
  { id: 3, value: 'Парковка А' },
  { id: 4, value: 'Парковка Б' },
  { id: 5, value: 'На маршруте' }
];

/**
 * Типы АСПТ (Агрегаты, системы, приборы и тормозные устройства)
 * API endpoint: GET /api/aspt-types
 */
export const ASPT_TYPES = [
  { id: 1, value: 'Тормозная система' },
  { id: 2, value: 'Подвеска' },
  { id: 3, value: 'Электрооборудование' },
  { id: 4, value: 'Трансмиссия' },
  { id: 5, value: 'Двигатель' }
];

/**
 * Состояния АСПТ
 * API endpoint: GET /api/aspt-states
 */
export const ASPT_STATES = [
  { id: 1, value: 'Исправна' },
  { id: 2, value: 'Требует проверки' },
  { id: 3, value: 'На регулировке' },
  { id: 4, value: 'Неисправна' }
];

/**
 * Исполнители (сотрудники, ответственные за машины)
 * API endpoint: GET /api/executors
 */
export const EXECUTORS = [
  { id: 1, value: 'Иван Петров' },
  { id: 2, value: 'Сергей Сидоров' },
  { id: 3, value: 'Мария Иванова' },
  { id: 4, value: 'Алексей Смирнов' },
  { id: 5, value: 'Дмитрий Кузнецов' }
];

/**
 * Маппинг состояний АСПТ к цветам Badge (Bootstrap)
 * Используется для визуального отображения статуса
 */
export const ASPT_STATE_COLORS = {
  'Исправна': 'success',       // зелёный
  'Требует проверки': 'warning', // жёлтый
  'На регулировке': 'info',     // голубой
  'Неисправна': 'danger'        // красный
};

/**
 * Функция для определения цвета даты следующего ТО
 * @param {string} dateString - дата в формате YYYY-MM-DD
 * @returns {string} - Bootstrap Badge variant (success, warning, danger)
 */
export const getDateColor = (dateString) => {
  if (!dateString) return 'secondary';
  
  const targetDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Дата прошла
  if (targetDate < today) {
    return 'danger'; // красный
  }
  
  // Дата в течение 7 дней
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  if (targetDate <= sevenDaysFromNow) {
    return 'warning'; // жёлтый
  }
  
  // Дата в хорошем диапазоне
  return 'success'; // зелёный
};