import React, { useState, useEffect, useCallback } from 'react';
import { useCars } from './hooks/useCars';
import { useCarForm } from './hooks/useCarForm';
import { filterCars } from './utils/carHelpers';
import { useAuth } from '../../auth/AuthContext';
import CarsFilter from './components/CarsFilter/CarsFilter'; 
import CarsTable from './components/CarsTable/CarsTable';     
import CarForm from './components/CarForm/CarForm';
import VehicleHistoryModal from './components/VehicleHistoryModal/VehicleHistoryModal';
import {
  saveOrUpdateInstallation,
  saveVehicle,
  updateVehicle,
  fetchAsptModels,
  findAsptModelIdByName,
  ensureAsptUnit
} from './utils/constantsApi';


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

  const reloadCars = useCallback(async () => {
    try {
      const { getCarData } = await import('./utils/testDataHelper');
      const data = await getCarData(user);
      setApiCars(data);
      if (data && data.length) {
        setColumns((prev) => Array.from(new Set([...prev, ...Object.keys(data[0])])));
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  }, [user]);

  useEffect(() => {
    reloadCars();
  }, [reloadCars]);

  // передаём данные из API в useCars
  const { cars, deleteCar } = useCars(apiCars);

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
    (async () => {
      try {
        const extractId = (v) => {
          if (v == null) return 0;
          if (typeof v === 'object') return Number(v.id || v.value || 0);
          return Number(v) || 0;
        };

        const vehiclePayload = {
          customer: extractId(selectedCar.customer),
          vehicle_type: extractId(selectedCar.ts_type),
          vehicle_model: extractId(selectedCar.ts_model),
          garage_no: selectedCar.garage_number || selectedCar.garage_no || '',
          location: extractId(selectedCar.location),
          is_active: typeof selectedCar.is_active === 'boolean' ? selectedCar.is_active : true,
          comment_general: selectedCar.comment || ''
        };

        let vehicleId = selectedCar.id || selectedCar.vehicle_id || selectedCar.vehicleId;
        if (vehicleId) {
          await updateVehicle(user, vehicleId, vehiclePayload);
        } else {
          const savedVehicle = await saveVehicle(user, vehiclePayload);
          vehicleId = savedVehicle.id || savedVehicle.vehicle_id || savedVehicle.pk;
        }

        vehicleId = Number(vehicleId);
        if (!vehicleId) {
          console.error('Vehicle save failed: no vehicle id returned');
          return;
        }

        if (Array.isArray(selectedCar.aspt_types) && selectedCar.aspt_types.length > 0) {
          const asptModels = await fetchAsptModels(user);
          const asptModelId = findAsptModelIdByName(asptModels, selectedCar.aspt_types[0]);

          if (!asptModelId) {
            console.error('ASPT model not found by name:', selectedCar.aspt_types[0]);
            return;
          }

          const asptUnitId = await ensureAsptUnit(user, {
            asptModelId,
            note: selectedCar.comment || ''
          });

          if (!asptUnitId) {
            console.error('Failed to resolve aspt unit id');
            return;
          }

          const now = new Date();
          const todaysDate = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0')
          ].join('-');

          const installationPayload = {
            vehicle: vehicleId,
            aspt_unit: asptUnitId,
            installed_at: todaysDate,
            removed_at: null
          };

          const installationId =
            selectedCar.installation_id ||
            selectedCar.installation?.id ||
            null;

          await saveOrUpdateInstallation(
            user,
            vehicleId,
            installationPayload,
            installationId
          );
        }

        await reloadCars();
        handleClose();
      } catch (e) {
        console.error('Save failed:', e);
      }
    })();
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
        onDataChanged={reloadCars}
      />
    </div>
  );
};

export default Cars;
