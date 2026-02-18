import React, { useState, useEffect } from 'react';
import { useCars } from './hooks/useCars';
import { useCarForm } from './hooks/useCarForm';
import { filterCars } from './utils/carHelpers';
import { useAuth } from '../../auth/AuthContext';
import CarsFilter from './components/CarsFilter/CarsFilter'; 
import CarsTable from './components/CarsTable/CarsTable';     
import CarForm from './components/CarForm/CarForm';

const Cars = () => {
  const [activeView, setActiveView] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [apiCars, setApiCars] = useState([]);        // <-- данные из API
  const [columns, setColumns] = useState([]);

  // столбцы для отображения (русские метки)
  const [columnLabels, setColumnLabels] = useState({
    garage_number: 'Гаражный №',
    ts_type: 'Тип ТС',
    ts_model: 'Модель ТС',
    location: 'Местоположение',
    last_to_date: 'Последнее ТО',
    next_to_date: 'Следующее ТО',
    aspt_types: 'Типы АСПТ',
    aspt_state: 'Состояние АСПТ',
    comment: 'Комментарий',
    executor: 'Исполнитель',
    // добавьте другие соответствия по мере необходимости
  });

  // --- Загружаем данные из API или тестовые данные ---
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Импортируем помощник
        const { getCarData } = await import('./utils/testDataHelper');
        
        const data = await getCarData(user);
        setApiCars(data);
        if (data && data.length) {
          // Устанавливаем все ключи из первого элемента в начальные столбцы
          setColumns(Object.keys(data[0]));
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      }
    };

    fetchData();
  }, [user]);

  // передаём данные из API в useCars
  const { cars, addCar, updateCar, deleteCar } = useCars(apiCars);

  // при добавлении/обновлении списка машин объединяем ключи,
  // не дублируя существующие колонки и сохраняя порядок
  React.useEffect(() => {
    if (cars.length) {
      const allKeys = Array.from(
        cars.reduce((set, car) => {
          Object.keys(car).forEach(k => set.add(k));
          return set;
        }, new Set())
      );

      setColumns(prev => {
        const merged = Array.from(new Set([...prev, ...allKeys]));
        if (merged.length === prev.length && merged.every((v,i) => v === prev[i])) {
          return prev;
        }
        return merged;
      });
    }
  }, [cars]);

  // когда список колонок изменяется, добавляем метки для новых ключей
  React.useEffect(() => {
    if (columns.length) {
      setColumnLabels(prev => {
        const updated = { ...prev };
        columns.forEach(col => {
          if (!(col in updated)) {
            // автоматическое название: заменяем _ на пробел и делаем первую букву заглавной
            const human = col
              .split('_')
              .map(w => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ');
            updated[col] = human;
          }
        });
        return updated;
      });
    }
  }, [columns]);

  const {
    selectedCar,
    showModal,
    setSelectedCar,
    handleAdd,
    handleEdit,
    handleClose
  } = useCarForm(cars);


  const filteredCars = filterCars(cars, activeView, searchTerm, columns);

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
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
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
          columns={columns}
          columnLabels={columnLabels}
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
        columnLabels={columnLabels}
      />
    </div>
  );
};

export default Cars;