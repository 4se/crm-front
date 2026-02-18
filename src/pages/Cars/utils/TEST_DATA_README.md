# Тестовые данные для разработки

## Как использовать тестовые данные

### Опция 1: Использование testDataHelper.js (рекомендуется)

1. В `Cars.js` замените fetchCars эффект на:

```js
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  const fetchData = async () => {
    try {
      // Импортируйте помощник
      const { getCarData } = await import('./utils/testDataHelper');
      
      const data = await getCarData(user);
      setApiCars(data);
      if (data && data.length && !columns.length) {
        setColumns(Object.keys(data[0]));
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  fetchData();
}, [user, columns.length]);
```

2. Затем отредактируйте `testDataHelper.js` и установите `USE_TEST_DATA = true`.

### Опция 2: Прямое использование testData.json

```js
import testCars from './utils/testData.json';

// В useEffect:
setApiCars(testCars);
if (testCars && testCars.length && !columns.length) {
  setColumns(Object.keys(testCars[0]));
}
```

## Структура тестовых данных

Файл `testData.json` содержит 3 тестовых записи (автомобили) с полными данными:

- **garage_number**: Номер гаража (строка)
- **ts_type**: Тип транспортного средства (объект с id и value)
- **ts_model**: Модель ТС с брендом (вложенный объект)
- **location**: Местоположение (объект)
- **last_to_date**: Дата последнего ТО (строка ISO)
- **next_to_date**: Дата следующего ТО (строка ISO)
- **aspt_types**: Типы АСПТ (массив объектов или пустой массив `[]`)
- **aspt_state**: Состояние АСПТ (объект)
- **comment**: Комментарий (строка)
- **executor**: Исполнитель (строка)

## Проверка функциональности

1. **Пустой массив** (запись 2):
   - `aspt_types` пуст - в форме добавления НЕ должно отображаться поле ТИП АСПТ

2. **Непустой массив** (запись 1, 3):
   - `aspt_types` содержит элементы - должны отображаться в форме

3. **Поле executor**:
   - Проверить что поле "Исполнитель" отображается во всех 3 записях

4. **Динамические колонки**:
   - Все 9 основных полей должны преобразоваться в колонки таблицы с русскими названиями

## Возврат к реальному API

Просто установите `USE_TEST_DATA = false` в `testDataHelper.js` или удалите использование тестовых данных.
