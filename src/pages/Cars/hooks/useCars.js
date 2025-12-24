import { useState, useEffect } from 'react';

export const useCars = (initialData = []) => {
  const [cars, setCars] = useState(initialData);

  // Обновляем состояние, когда приходят новые данные из API
  useEffect(() => {
    setCars(initialData);
  }, [initialData]);

  const addCar = (newCar) => {
    const carWithId = {
      ...newCar,
      id: Math.max(...cars.map(car => car.id), 0) + 1
    };
    setCars(prev => [...prev, carWithId]);
  };

  const updateCar = (updatedCar) => {
    setCars(prev => prev.map(car =>
      car.id === updatedCar.id ? updatedCar : car
    ));
  };

  const deleteCar = (carId) => {
    setCars(prev => prev.filter(car => car.id !== carId));
  };

  return {
    cars,
    addCar,
    updateCar,
    deleteCar
  };
};
