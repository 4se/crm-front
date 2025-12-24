import { useState } from 'react';

export const useCarForm = (cars = []) => {
  const [selectedCar, setSelectedCar] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const generateGarageNumber = () => {
    if (!cars.length) return 'ГН-001';

    const max = Math.max(
      ...cars.map(c =>
        Number(c.garage_number?.replace('ГН-', '')) || 0
      )
    );

    return `ГН-${String(max + 1).padStart(3, '0')}`;
  };

  const handleAdd = () => {
    setSelectedCar({
      id: null,
      garage_number: generateGarageNumber(),

      ts_type: null,
      ts_model: null,
      location: null,

      last_to_date: null,
      next_to_date: null,

      aspt_state: null,
      aspt_types: [],

      comment: ''
    });

    setShowModal(true);
  };

  const handleEdit = (car) => {
    setSelectedCar({ ...car });
    setShowModal(true);
  };

  const handleClose = () => {
    setSelectedCar(null);
    setShowModal(false);
  };

  return {
    selectedCar,
    showModal,
    setSelectedCar,
    handleAdd,
    handleEdit,
    handleClose
  };
};
