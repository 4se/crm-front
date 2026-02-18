# Загрузка констант с бекэнда

Этот документ описывает, как настроить загрузку констант (выпадающих списков) с бекэнда.

## Текущая структура

### Локальные константы (`constants.js`)
Все константы сейчас определены локально в файле `src/pages/Cars/utils/constants.js`:
- `VEHICLE_TYPES` - Типы ТС
- `LOCATIONS` - Локации
- `ASPT_TYPES` - Типы АСПТ
- `ASPT_STATES` - Состояния АСПТ
- `EXECUTORS` - Исполнители

### API слой (`constantsApi.js`)
Файл `src/pages/Cars/utils/constantsApi.js` содержит функции для загрузки констант с бекэнда:
- `fetchVehicleTypes(token)` - загрузить типы ТС
- `fetchLocations(token)` - загрузить локации
- `fetchAsptTypes(token)` - загрузить типы АСПТ
- `fetchAsptStates(token)` - загрузить состояния АСПТ
- `fetchExecutors(token)` - загрузить исполнителей
- `fetchAllConstants(token)` - загрузить все константы одновременно

### Custom Hook (`useConstants.js`)
Hook `src/pages/Cars/hooks/useConstants.js` автоматически загружает все константы при монтировании компонента.

## Как использовать на фронтенде

### Вариант 1: Использовать hook (рекомендуется)

```jsx
import { useConstants } from './hooks/useConstants';

function MyComponent() {
  const { vehicleTypes, locations, asptTypes, asptStates, executors, loading, error } = useConstants();
  
  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  
  return (
    <Form.Select>
      <option value="">Выберите тип ТС</option>
      {vehicleTypes.map(item => (
        <option key={item.id} value={item.value}>{item.value}</option>
      ))}
    </Form.Select>
  );
}
```

### Вариант 2: Использовать функции напрямую

```jsx
import { fetchVehicleTypes } from './utils/constantsApi';
import { useAuth } from '../../auth/AuthContext';

function MyComponent() {
  const { user } = useAuth();
  const [types, setTypes] = useState([]);

  useEffect(() => {
    const loadTypes = async () => {
      const data = await fetchVehicleTypes(user?.token);
      setTypes(data);
    };
    loadTypes();
  }, [user]);

  return (
    <Form.Select>
      {types.map(item => (
        <option key={item.id} value={item.value}>{item.value}</option>
      ))}
    </Form.Select>
  );
}
```

## Как интегрировать с реальным бекэндом

1. **Замените TODO комментарии в `constantsApi.js`**

Раскомментируйте реальные API запросы и заполните корректные endpoints:

```javascript
export const fetchVehicleTypes = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicle-types`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Ошибка загрузки');
    return await response.json();
  } catch (error) {
    console.error('Ошибка загрузки типов ТС:', error);
    const { VEHICLE_TYPES } = await import('./constants');
    return VEHICLE_TYPES; // fallback
  }
};
```

2. **Установите переменные окружения**

В файле `.env`:
```
REACT_APP_API_URL=https://your-api.com/api
```

3. **Убедитесь что API возвращает правильный формат**

API должен возвращать массив объектов с структурой:
```json
[
  { "id": 1, "value": "Грузовик" },
  { "id": 2, "value": "Легковой" }
]
```

4. **Добавьте обработку ошибок авторизации**

Если токен истёк, обработайте 401 ошибку и перенаправьте на логин:

```javascript
if (response.status === 401) {
  // redirect to login
}
```

## Преимущества текущей архитектуры

✅ **Fallback механизм** - если бекэнд недоступен, использует локальные константы
✅ **Кэширование** - константы загружаются один раз при монтировании
✅ **Простая интеграция** - достаточно раскомментировать fetch запросы
✅ **Type-safe** - структура данных одинакова везде
✅ **Легко тестировать** - можно использовать локальные константы для тестов

## Структура данных

Все константы должны иметь формат:
```typescript
interface ConstantItem {
  id: number;
  value: string;
}
```

Это позволяет легко использовать их в `select` элементах и сохранять в БД по ID.
