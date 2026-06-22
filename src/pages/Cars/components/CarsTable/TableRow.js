import React from 'react';
import { Button, Badge } from 'react-bootstrap';
import { Pencil, Trash } from 'react-bootstrap-icons';
import { ASPT_STATE_COLORS, getDateColor } from '../../utils/constants';

// generic row renderer based on provided columns
const TableRow = ({ car, columns = [], columnLabels = {}, onEdit, onDelete, onDoubleClick }) => {
  const renderCell = (key) => {
    const val = car[key];
    if (val == null) return '';
    
    // специальная обработка для модели ТС - выводит "Brand Model"
    if (key === 'ts_model' && typeof val === 'object' && val !== null) {
      const brand = val.brand?.value || val.brand || '';
      const model = val.value || '';
      const cellValue = brand && model ? `${brand} ${model}` : model || brand;
      return cellValue;
    }
    
    // если массив объектов - берем value из каждого
    let cellValue;
    if (Array.isArray(val)) {
      cellValue = val
        .map(item => {
          if (typeof item === 'object' && item !== null && 'value' in item) {
            return item.value;
          }
          return typeof item === 'object' ? JSON.stringify(item) : item;
        })
        .join(', ');
    } else if (typeof val === 'object' && val !== null) {
      // если объект с ключом value - берем его значение
      if ('value' in val) {
        cellValue = val.value;
      } else {
        // иначе JSON.stringify полностью
        cellValue = JSON.stringify(val);
      }
    } else {
      cellValue = val;
    }
    
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

  return (
    <tr
      onDoubleClick={() => onDoubleClick && onDoubleClick(car)}
      style={{ cursor: onDoubleClick ? 'pointer' : 'default' }}
      title={onDoubleClick ? 'Double click to open history' : undefined}
    >
      {columns.map(col => (
        <td key={col}>{renderCell(col)}</td>
      ))}
      {(onEdit || onDelete) && (
        <td>
          <div className="d-flex gap-1">
            {onEdit && (
              <Button
                size="sm"
                variant="outline-primary"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(car);
                }}
              >
                <Pencil size={12} />
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="outline-danger"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(car.id);
                }}
              >
                <Trash size={12} />
              </Button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
};

export default TableRow;
