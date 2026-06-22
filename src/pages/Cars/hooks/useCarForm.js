import { useState } from 'react';

export const useCarForm = (cars = [], user = null) => {
  const [selectedCar, setSelectedCar] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const generateGarageNumber = () => {
    if (!cars.length) return '1';

    const max = Math.max(
      ...cars.map(c => Number(c.garage_number?.toString().replace('ГН-', '')) || 0)
    );

    return String(max + 1);
  };

  const handleAdd = () => {
    setSelectedCar({
      id: null,
      garage_number: generateGarageNumber(),
      customer: null,
      ts_type: null,
      ts_model: null,
      location: null,

      last_to_date: null,
      next_to_date: null,

      aspt_state: null,
      aspt_types: [],

      comment: '',
      executor: user?.username || ''
    });

    setShowModal(true);
  };

  const handleEdit = (car) => {
    // Ensure `customer` field exists so the form renders the select
    setSelectedCar({ ...car, customer: ('customer' in car) ? car.customer : null });
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
