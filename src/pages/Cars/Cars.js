import React, { useState, useEffect } from 'react';
import { useCars } from './hooks/useCars';
import { useCarForm } from './hooks/useCarForm';
import { filterCars } from './utils/carHelpers';
import { useAuth } from '../../auth/AuthContext';
import CarsFilter from './components/CarsFilter/CarsFilter'; 
import CarsTable from './components/CarsTable/CarsTable';     
import CarForm from './components/CarForm/CarForm';
import VehicleHistoryModal from './components/VehicleHistoryModal/VehicleHistoryModal';
import { saveInstallation, updateInstallation, saveVehicle, updateVehicle, fetchAsptUnits } from './utils/constantsApi';


// car.id || car.vehicle_id || car.vehicleId || 
const getVehicleKey = (car) => car.garage_number;

const getUniqueCars = (cars) => {
  const uniqueCars = new Map();

  cars.forEach((car) => {
    uniqueCars.set(getVehicleKey(car), car);
  });

  return Array.from(uniqueCars.values());
};

const Cars = () => {
  const [activeView, setActiveView] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [apiCars, setApiCars] = useState([]);        // <-- данные из API
  const [columns, setColumns] = useState([]);
  const [historyCar, setHistoryCar] = useState(null);

  // столбцы для отображения (русские метки)
  const [columnLabels, setColumnLabels] = useState({
    garage_number: 'Гаражный №',
    customer: 'Заказчик',
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
  } = useCarForm(cars, user);


  const mainCars = getUniqueCars(cars);
  const filteredCars = filterCars(mainCars, activeView, searchTerm, columns);

  const handleSave = () => {
    if (selectedCar.id === null) {
      addCar(selectedCar);
    } else {
      updateCar(selectedCar);
    }

    (async () => {
      try {
        const vehicle = selectedCar.id || selectedCar.vehicle_id || selectedCar.vehicleId || null;
        const todaysDate = new Date().toISOString().slice(0, 10);

        let asptModelId = null;
        if (Array.isArray(selectedCar.aspt_types) && selectedCar.aspt_types.length > 0) {
          const first = selectedCar.aspt_types[0];
          if (first && typeof first === 'object') {
            asptModelId = first.id || first.aspt_model || first.value_id || null;
          } else if (typeof first === 'number') {
            asptModelId = first;
          } else if (typeof first === 'string') {
            asptModelId = first;
          }
        } else if (selectedCar.aspt_model) {
          asptModelId = selectedCar.aspt_model;
        }

        const asptUnits = await fetchAsptUnits(user);
        const matchingUnit = asptUnits.find(unit => Number(unit.aspt_model) === Number(asptModelId));
        const fallbackUnit = asptUnits[0];
        const asptUnit = matchingUnit ? Number(matchingUnit.id) : (fallbackUnit ? Number(fallbackUnit.id) : null);

        const payload = {
          vehicle: Number(vehicle || 0),
          aspt_unit: asptUnit,
          installed_at: todaysDate,
          removed_at: null
        };

        if (selectedCar.installation_id) {
          await updateInstallation(user, selectedCar.installation_id, payload);
        } else {
          await saveInstallation(user, payload);
        }
      } catch (e) {
        console.error('Installation save failed:', e);
      }
    })();

    // Send vehicle data to backend (POST for new, PATCH for existing)
    (async () => {
      try {
        console.log('=== VEHICLE ASYNC START ===');
        const extractId = (v) => {
          if (v == null) return 0;
          if (typeof v === 'object') return Number(v.id || v.value || 0);
          return Number(v) || 0;
        };

        const payload = {
          customer: extractId(selectedCar.customer),
          vehicle_type: extractId(selectedCar.ts_type),
          vehicle_model: extractId(selectedCar.ts_model),
          garage_no: selectedCar.garage_number || selectedCar.garage_no || '',
          location: extractId(selectedCar.location),
          is_active: typeof selectedCar.is_active === 'boolean' ? selectedCar.is_active : true,
          comment_general: selectedCar.comment || ''
        };

        const vehicleId = selectedCar.id || selectedCar.vehicle_id || selectedCar.vehicleId;
        
        console.log('Sending vehicle request:', {
          method: vehicleId ? 'PATCH' : 'POST',
          vehicleId,
          payload
        });

        // Use PATCH if vehicle has an id, otherwise POST
        if (vehicleId) {
          console.log('Calling updateVehicle with ID:', vehicleId);
          await updateVehicle(user, vehicleId, payload);
          console.log('updateVehicle success');
        } else {
          console.log('Calling saveVehicle');
          await saveVehicle(user, payload);
          console.log('saveVehicle success');
        }
        console.log('=== VEHICLE ASYNC END ===');
      } catch (e) {
        console.error('Vehicle save failed:', e);
      }
    })();

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
          onRowDoubleClick={setHistoryCar}
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

      <VehicleHistoryModal
        show={Boolean(historyCar)}
        car={historyCar}
        user={user}
        columns={columns}
        columnLabels={columnLabels}
        onClose={() => setHistoryCar(null)}
      />
    </div>
  );
};

export default Cars;
