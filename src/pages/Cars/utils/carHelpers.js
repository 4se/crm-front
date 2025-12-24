export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

export const filterCars = (cars, activeView) => {
  if (activeView === 'all') return cars;
  if (activeView === 'working') return cars.filter(car => car.systemStatus === 'Исправна');
  if (activeView === 'repair') return cars.filter(car => car.systemStatus !== 'Исправна');
  return cars;
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