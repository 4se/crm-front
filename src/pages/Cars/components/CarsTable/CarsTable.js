import React, { useState, useEffect } from 'react';
import { Table, Card, Badge, Button } from 'react-bootstrap';
import { ASPT_STATE_COLORS, getDateColor } from '../../utils/constants';
import TableRow from './TableRow';

// helper to render value - extracts 'value' key from nested objects
const renderCellValue = (car, key) => {
  const val = car[key];
  if (val == null) return '';
  
  // специальная обработка для модели ТС - выводит "Brand Model"
  if (key === 'ts_model' && typeof val === 'object' && val !== null) {
    const brand = val.brand?.value || val.brand || '';
    const model = val.value || '';
    return brand && model ? `${brand} ${model}` : model || brand;
  }
  
  // если массив объектов - берем value из каждого
  if (Array.isArray(val)) {
    return val
      .map(item => {
        if (typeof item === 'object' && item !== null && 'value' in item) {
          return item.value;
        }
        return typeof item === 'object' ? JSON.stringify(item) : item;
      })
      .join(', ');
  }
  
  // если объект с ключом value - берем его значение
  if (typeof val === 'object' && val !== null) {
    if ('value' in val) {
      return val.value;
    }
    // иначе JSON.stringify полностью
    return JSON.stringify(val);
  }
  
  return val;
};

// helper для отображения ячеек с цветовыми индикаторами
const renderColoredCell = (car, key) => {
  const cellValue = renderCellValue(car, key);
  
  // Окрашиваем состояние АСПТ
  if (key === 'aspt_state' && cellValue) {
    const color = ASPT_STATE_COLORS[cellValue] || 'secondary';
    return <Badge bg={color}>{cellValue}</Badge>;
  }
  
  // Окрашиваем дату следующего ТО
  if (key === 'next_to_date' && cellValue) {
    const color = getDateColor(car[key]);
    return <Badge bg={color}>{cellValue}</Badge>;
  }
  
  return cellValue;
};

// карточка для мобильных экранов
const CarCard = ({ car, columns, columnLabels, onEdit, onDelete }) => {
  // поля для отображения в плитке
  const displayFields = ['garage_number', 'ts_model', 'aspt_state', 'next_to_date', 'executor'];

  return (
    <Card className="mb-2 h-100">
      <Card.Body className="d-flex flex-column">
        <div className="flex-grow-1">
          {displayFields.map((field) => {
            if (!car.hasOwnProperty(field)) return null;
            const value = renderColoredCell(car, field);
            const label = columnLabels[field] || field;
            
            return (
              <div key={field} className="mb-1">
                <small className="text-muted">{label}:</small><br />
                <strong>{value}</strong>
              </div>
            );
          })}
        </div>
        <div className="d-flex gap-1 mt-2">
          <Button size="sm" variant="outline-primary" onClick={() => onEdit(car)}>
            Ред.
          </Button>
          <Button size="sm" variant="outline-danger" onClick={() => onDelete(car.id)}>
            Уд.
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

const CarsTable = ({ cars, columns = [], columnLabels = {}, onEdit, onDelete }) => {
  const tableMaxHeight = 'calc(100vh - 200px)';
  const [isMobile, setIsMobile] = useState(window.innerWidth < 576);
  // скрываем столбец id от отображения
  const visibleColumns = columns.filter(col => col !== 'id');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 575px)');
    const handleChange = (e) => setIsMobile(e.matches);
    
    // Устанавливаем начальное значение
    setIsMobile(mediaQuery.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <Card className="shadow-sm flex-grow-1 d-flex flex-column">
      <Card.Header className="bg-white">
        <h5 className="mb-0">
          Журнал транспортных средств
          <span className="text-muted ms-2">({cars.length})</span>
        </h5>
      </Card.Header>

      <Card.Body className="p-0 flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>
        <div style={{ overflow: 'auto', flex: 1, maxHeight: tableMaxHeight }}>
          {isMobile ? (
            <div className="p-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px' }}>
              {cars.length ? (
                cars.map(car => (
                  <CarCard
                    key={car.id}
                    car={car}
                    columns={visibleColumns}
                    columnLabels={columnLabels}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))
              ) : (
                <p className="text-center py-4 text-muted">Нет данных</p>
              )}
            </div>
          ) : (
            <Table responsive hover className="mb-0" style={{ minWidth: '1200px' }}>
              <thead className="bg-light" style={{ position: 'sticky', top: 0 }}>
                <tr>
                  {visibleColumns.map(col => (
                    <th key={col}>{columnLabels[col] || col}</th>
                  ))}
                  <th>Действия</th>
                </tr>
              </thead>

              <tbody>
                {cars.length ? (
                  cars.map(car => (
                    <TableRow
                      key={car.id}
                      car={car}
                      columns={visibleColumns}
                      columnLabels={columnLabels}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={visibleColumns.length + 1} className="text-center py-4 text-muted">
                      Нет данных
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default CarsTable;