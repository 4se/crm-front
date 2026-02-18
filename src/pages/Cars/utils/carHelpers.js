export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

/**
 * Конвертирует значение в строку для поиска
 * Обработка объектов с .value, массивов и других типов данных
 */
const convertValueToString = (value, key = '') => {
  if (value == null) return '';
  
  // специальная обработка для модели ТС - выводит "Brand Model"
  if (key === 'ts_model' && typeof value === 'object' && value !== null) {
    const brand = value.brand?.value || value.brand || '';
    const model = value.value || '';
    return brand && model ? `${brand} ${model}` : model || brand;
  }
  
  // если массив объектов - извлекаем value из каждого
  if (Array.isArray(value)) {
    return value
      .map(item => {
        if (typeof item === 'object' && item !== null && 'value' in item) {
          return item.value;
        }
        return typeof item === 'object' ? JSON.stringify(item) : item;
      })
      .join(', ');
  }
  
  // если объект с ключом value - берем его значение
  if (typeof value === 'object') {
    if ('value' in value) {
      return String(value.value);
    }
    return JSON.stringify(value);
  }
  
  return String(value);
};

export const filterCars = (cars, activeView, searchTerm = '', columns = []) => {
  let result = cars;
  
  if (activeView === 'working') {
    result = result.filter(car => car.systemStatus === 'Исправна');
  } else if (activeView === 'repair') {
    result = result.filter(car => car.systemStatus !== 'Исправна');
  }

  if (searchTerm && searchTerm.trim()) {
    const lower = searchTerm.toLowerCase();
    result = result.filter(car => {
      // if columns provided, search through all columns
      if (columns.length > 0) {
        return columns.some(col => {
          if (col === 'id') return false; // skip id column
          const value = convertValueToString(car[col], col);
          return value.toLowerCase().includes(lower);
        });
      }
      
      // fallback to hardcoded fields if columns not provided
      const garage = String(car.garage_number || '').toLowerCase();
      const type = String(car.ts_type?.value || '').toLowerCase();
      const model = convertValueToString(car.ts_model, 'ts_model').toLowerCase();
      const location = String(car.location?.value || '').toLowerCase();
      const comment = String(car.comment || '').toLowerCase();

      return (
        garage.includes(lower) ||
        type.includes(lower) ||
        model.includes(lower) ||
        location.includes(lower) ||
        comment.includes(lower)
      );
    });
  }

  return result;
};

export const getStatusColor = (status) => {
  const statusColors = {
    'Исправна': 'success',
    'Требует проверки': 'warning',
    'На регулировке': 'info',
    'Неисправна': 'danger'
  };
  return statusColors[status] || 'secondary';
};

export const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};