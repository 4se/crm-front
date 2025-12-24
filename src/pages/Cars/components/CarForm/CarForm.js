import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { CAR_STATUSES, VEHICLE_TYPES, REQUEST_TYPES } from '../../utils/constants';

const CarForm = ({ 
  show, 
  car, 
  onSave, 
  onClose, 
  onChange 
}) => {
  if (!car) return null;

  const isEditing = car.id !== null;

  return (
    <Modal show={show} onHide={onClose} size="lg" centered scrollable>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>
          {isEditing ? 'Редактирование' : 'Добавление'} 
          записи: {car.garageNumber}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row g-3">
          <div className="col-md-6">
            <Form.Label>Дата</Form.Label>
            <Form.Control 
              type="date" 
              value={car.date}
              onChange={(e) => onChange('date', e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <Form.Label>Гаражный номер</Form.Label>
            <Form.Control 
              type="text" 
              value={car.garageNumber}
              onChange={(e) => onChange('garageNumber', e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <Form.Label>Тип ТС</Form.Label>
            <Form.Select 
              value={car.vehicleType}
              onChange={(e) => onChange('vehicleType', e.target.value)}
            >
              <option value="">Выберите тип ТС</option>
              {VEHICLE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Form.Select>
          </div>
          <div className="col-md-6">
            <Form.Label>Модель ТС</Form.Label>
            <Form.Control 
              type="text" 
              value={car.vehicleModel}
              onChange={(e) => onChange('vehicleModel', e.target.value)}
              placeholder="Введите модель ТС"
            />
          </div>
          <div className="col-12">
            <Form.Label>Тип заявки</Form.Label>
            <Form.Select 
              value={car.requestType}
              onChange={(e) => onChange('requestType', e.target.value)}
            >
              <option value="">Выберите тип заявки</option>
              {REQUEST_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Form.Select>
          </div>
          <div className="col-md-6">
            <Form.Label>Тип системы</Form.Label>
            <Form.Control 
              type="text" 
              value={car.systemType}
              onChange={(e) => onChange('systemType', e.target.value)}
              placeholder="Например: Тормозная система"
            />
          </div>
          <div className="col-md-6">
            <Form.Label>Состояние системы</Form.Label>
            <Form.Select 
              value={car.systemStatus}
              onChange={(e) => onChange('systemStatus', e.target.value)}
            >
              <option value="">Выберите состояние</option>
              {CAR_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </Form.Select>
          </div>
          <div className="col-12">
            <Form.Label>Выполненные работы</Form.Label>
            <Form.Control 
              as="textarea"
              rows="3"
              value={car.completedWorks}
              onChange={(e) => onChange('completedWorks', e.target.value)}
              placeholder="Опишите выполненные работы"
            />
          </div>
          <div className="col-12">
            <Form.Label>Прочие неисправности</Form.Label>
            <Form.Control 
              as="textarea"
              rows="2"
              value={car.otherIssues}
              onChange={(e) => onChange('otherIssues', e.target.value)}
              placeholder="Опишите прочие неисправности"
            />
          </div>
          <div className="col-md-6">
            <Form.Label>Исполнитель</Form.Label>
            <Form.Control 
              type="text" 
              value={car.executor}
              onChange={(e) => onChange('executor', e.target.value)}
              placeholder="ФИО исполнителя"
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onSave}>
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