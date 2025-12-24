import React, { useState,useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useCars } from './hooks/useCars';
import { useCarForm } from './hooks/useCarForm';
import { filterCars } from './utils/carHelpers';
import CarsFilter from './components/CarsFilter/CarsFilter'; 
import CarsTable from './components/CarsTable/CarsTable';     
import CarForm from './components/CarForm/CarForm';  

const Cars = () => {
  const [activeView, setActiveView] = useState('all');
  const [apiCars, setApiCars] = useState([]);        // <-- данные из API
  const [loading, setLoading] = useState(true);

  // --- Загружаем данные из API ---
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch('https://api.diplom.miray-tech.ru/api/vehicles/', {
          method: 'GET',
          headers: {
            'Authorization': 'Basic ' + btoa('test:test')
          }
        });
         // <-- твой API эндпоинт
        const data = await response.json();
        setApiCars(data);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  // передаём данные из API в useCars
  const { cars, addCar, updateCar, deleteCar } = useCars(apiCars);

  const {
    selectedCar,
    showModal,
    setSelectedCar,
    handleAdd,
    handleEdit,
    handleClose
  } = useCarForm(cars);


  const filteredCars = filterCars(cars, activeView);

  const handleSave = () => {
    if (selectedCar.id === null) {
      addCar(selectedCar);
    } else {
      updateCar(selectedCar);
    }
    handleClose();
  };

  const handleChange = (field, value) => {
    setSelectedCar(prev => ({ ...prev, [field]: value }));
  };

  const handleDelete = (carId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      deleteCar(carId);
    }
  };

  return (
    <div style={{ 
      Height: '100vh', 
      backgroundColor: '#f8f9fa', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden' // Предотвращаем прокрутку всей страницы
    }}>
      <CarsFilter 
        activeView={activeView}
        onViewChange={setActiveView}
        onAddCar={handleAdd}
      />

      {/* Убираем Container и используем простой div для выравнивания ширины */}
      <div style={{ 
        flex: '1 1 auto', 
        display: 'flex', 
        flexDirection: 'column',
        margin: '0 12px 12px 12px', // Отступы как у Container
        minHeight: 0 // Важно для правильной работы flex
      }}>
        <CarsTable 
          cars={filteredCars}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <CarForm 
        show={showModal}
        car={selectedCar}
        onSave={handleSave}
        onClose={handleClose}
        onChange={handleChange}
      />
    </div>
  );
};

export default Cars;