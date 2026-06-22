import React from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useConstants } from '../../hooks/useConstants';

const CarForm = ({ 
  show, 
  car, 
  onSave, 
  onClose, 
  onChange,
  columnLabels = {}
}) => {
  // загружаем константы из API с fallback на локальные значения
  const { 
    vehicleTypes: VEHICLE_TYPES, 
    vehicleModels: VEHICLE_MODELS, 
    locations: LOCATIONS, 
    asptTypes: ASPT_TYPES, 
    asptStates: ASPT_STATES, 
    executors: EXECUTORS,
    customers: CUSTOMERS,
    loading: constantsLoading
  } = useConstants();

  if (!car) return null;

  const isEditing = car.id !== null;

  // основные поля - дополнительные роили состояния
  const fieldOrder = [
    'garage_number',
    'customer',
    'ts_type',
    'ts_model',
    'location',
    'last_to_date',
    'next_to_date',
    'aspt_state',
    'aspt_types',
    'comment',
    'executor'
  ];

  const renderField = (key) => {
    const value = car[key] || '';
    const label = columnLabels[key] || key;

    // выпадающие списки для специальных полей
    if (key === 'ts_type') {
      const selectedValue = typeof value === 'object' && value?.value ? value.value : value;
      return (
        <div key={key} className="col-md-6">
          <Form.Label>{label}</Form.Label>
          <Form.Select
            value={selectedValue}
            onChange={(e) => {
              const selected = VEHICLE_TYPES.find(v => v.value === e.target.value);
              onChange(key, selected || e.target.value);
            }}
          >
            <option value="">Выберите тип ТС</option>
            {VEHICLE_TYPES.map(item => (
              <option key={item.id} value={item.value}>{item.value}</option>
            ))}
          </Form.Select>
        </div>
      );
    }

    if (key === 'ts_model') {
      const selectedValue = typeof value === 'object' && value?.value ? value.value : value;
      return (
        <div key={key} className="col-md-6">
          <Form.Label>{label}</Form.Label>
          <Form.Select
            value={selectedValue}
            onChange={(e) => {
              const selected = VEHICLE_MODELS.find(v => v.value === e.target.value);
              onChange(key, selected || e.target.value);
            }}
          >
            <option value="">Выберите модель ТС</option>
            {VEHICLE_MODELS.map(item => (
              <option key={item.id} value={item.value}>{item.brand} {item.value}</option>
            ))}
          </Form.Select>
        </div>
      );
    }

    if (key === 'location') {
      const selectedValue = typeof value === 'object' && value?.value ? value.value : value;
      return (
        <div key={key} className="col-md-6">
          <Form.Label>{label}</Form.Label>
          <Form.Select
            value={selectedValue}
            onChange={(e) => {
              const selected = LOCATIONS.find(v => v.value === e.target.value);
              onChange(key, selected || e.target.value);
            }}
          >
            <option value="">Выберите локацию</option>
            {LOCATIONS.map(item => (
              <option key={item.id} value={item.value}>{item.value}</option>
            ))}
          </Form.Select>
        </div>
      );
    }

    if (key === 'aspt_state') {
      const selectedValue = typeof value === 'object' && value?.value ? value.value : value;
      return (
        <div key={key} className="col-md-6">
          <Form.Label>{label}</Form.Label>
          <Form.Select
            value={selectedValue}
            onChange={(e) => {
              const selected = ASPT_STATES.find(v => v.value === e.target.value);
              onChange(key, selected || e.target.value);
            }}
          >
            <option value="">Выберите состояние АСПТ</option>
            {ASPT_STATES.map(item => (
              <option key={item.id} value={item.value}>{item.value}</option>
            ))}
          </Form.Select>
        </div>
      );
    }

    if (key === 'executor') {
      const selectedValue = typeof value === 'object' && value?.value ? value.value : value;
      return (
        <div key={key} className="col-md-6">
          <Form.Label>{label}</Form.Label>
          <Form.Select
            value={selectedValue}
            onChange={(e) => {
              const selected = EXECUTORS.find(v => v.value === e.target.value);
              onChange(key, selected || e.target.value);
            }}
          >
            <option value="">Выберите исполнителя</option>
            {EXECUTORS.map(item => (
              <option key={item.id} value={item.value}>{item.value}</option>
            ))}
          </Form.Select>
        </div>
      );
    }

    if (key === 'customer') {
      const selectedValue = typeof value === 'object' && value?.id ? value.id : value;
      return (
        <div key={key} className="col-md-6">
          <Form.Label>{label}</Form.Label>
          <Form.Select
            value={selectedValue}
            onChange={(e) => {
              const selected = CUSTOMERS.find(v => Number(v.id) === Number(e.target.value));
              onChange(key, selected || e.target.value);
            }}
          >
            <option value="">Выберите заказчика</option>
            {Array.isArray(CUSTOMERS) && CUSTOMERS.map(item => (
              <option key={item.id} value={item.id}>{item.name || item.value || item.id}</option>
            ))}
          </Form.Select>
        </div>
      );
    }

    // обрабатываем разные типы данных
    if (key.includes('date')) {
      return (
        <div key={key} className="col-md-6">
          <Form.Label>{label}</Form.Label>
          <Form.Control
            type="date"
            value={value}
            onChange={(e) => onChange(key, e.target.value)}
          />
        </div>
      );
    }

    if (key.includes('comment') || key.includes('description')) {
      return (
        <div key={key} className="col-12">
          <Form.Label>{label}</Form.Label>
          <Form.Control
            as="textarea"
            rows="3"
            value={value}
            onChange={(e) => onChange(key, e.target.value)}
            placeholder={`Введите ${label.toLowerCase()}`}
          />
        </div>
      );
    }

    // для числовых полей
    if (typeof value === 'number') {
      return (
        <div key={key} className="col-md-6">
          <Form.Label>{label}</Form.Label>
          <Form.Control
            type="number"
            value={value}
            onChange={(e) => onChange(key, parseInt(e.target.value) || 0)}
          />
        </div>
      );
    }

    // для объектов и массивов - показываем только если не пусто
    if (typeof value === 'object') {
      // не отображаем пустые массивы, кроме aspt_types
      if (Array.isArray(value) && value.length === 0 && key !== 'aspt_types') {
        return null;
      }

      // для aspt_types показываем select для выбора
      if (key === 'aspt_types' && Array.isArray(value)) {
        return (
          <div key={key} className="col-md-6">
            <Form.Label>{label}</Form.Label>
            <Form.Select
              multiple
              value={value.map(item => typeof item === 'object' && item?.value ? item.value : item)}
              onChange={(e) => {
                const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                const selectedItems = selectedValues.map(val => {
                  const found = ASPT_TYPES.find(item => item.value === val);
                  return found || val;
                });
                onChange(key, selectedItems);
              }}
              size={2}
            >
              {ASPT_TYPES.map(item => (
                <option key={item.id} value={item.value}>{item.value}</option>
              ))}
            </Form.Select>
          </div>
        );
      }

      // извлекаем значения: если массив - берем value из каждого объекта
      let stringValue;
      if (Array.isArray(value)) {
        stringValue = value
          .map(item => {
            if (typeof item === 'object' && item !== null && 'value' in item) {
              return item.value;
            }
            return typeof item === 'object' ? JSON.stringify(item, null, 2) : item;
          })
          .join('\n');
      } else {
        // если объект - берем value если есть, иначе JSON
        if ('value' in value) {
          stringValue = value.value;
        } else {
          stringValue = JSON.stringify(value, null, 2);
        }
      }

      return (
        <div key={key} className="col-md-6">
          <Form.Label>{label}</Form.Label>
          <Form.Control
            as="textarea"
            rows="1"
            value={stringValue}
            onChange={(e) => onChange(key, e.target.value)}
            placeholder={`JSON данные`}
          />
        </div>
      );
    }

    // строковые поля
    return (
      <div key={key} className="col-md-6">
        <Form.Label>{label}</Form.Label>
        <Form.Control
          type="text"
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
          placeholder={`Введите ${label.toLowerCase()}`}
        />
      </div>
    );
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered scrollable>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>
          {isEditing ? 'Редактирование ' : 'Добавление '} 
          записи: {car.garage_number || '-'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {constantsLoading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Загрузка констант...</span>
            </Spinner>
          </div>
        ) : (
          <div className="row g-3">
            {fieldOrder
              .filter(key => key in car && key !== 'id')
              .map(key => renderField(key))}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onSave} disabled={constantsLoading}>
          Сохранить
        </Button>
        <Button variant="outline-secondary" onClick={onClose}>
          Отмена
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CarForm;