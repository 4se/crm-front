import React from 'react';
import { Badge, Button } from 'react-bootstrap';
import { Pencil, Trash } from 'react-bootstrap-icons';
import StatusBadge from '../StatusBadge/StatusBadge';
import { formatDate, truncateText } from '../../utils/carHelpers';

const TableRow = ({ car, onEdit, onDelete }) => {
  return (
    <tr>
      {/* Гаражный номер */}
      <td>
        <Badge bg="primary">{car.garage_number}</Badge>
      </td>

      {/* Тип ТС */}
      <td>{car.ts_type?.value}</td>

      {/* Модель ТС */}
      <td>
        <strong>{car.ts_model?.brand?.value}</strong>{' '}
        {car.ts_model?.value}
      </td>

      {/* Местоположение */}
      <td>
        <Badge bg="secondary">{car.location?.value}</Badge>
      </td>

      {/* Последнее ТО */}
      <td>{formatDate(car.last_to_date)}</td>

      {/* Следующее ТО */}
      <td>{formatDate(car.next_to_date)}</td>

      {/* Типы АСПТ */}
      <td>
        {car.aspt_types?.length
          ? car.aspt_types.map(t => (
              <Badge key={t.id} bg="info" className="me-1">
                {t.value}
              </Badge>
            ))
          : '—'}
      </td>

      {/* Состояние АСПТ */}
      <td>
        <StatusBadge status={car.aspt_state?.value} />
      </td>

      {/* Комментарий */}
      <td>
        <small className="text-muted">
          {truncateText(car.comment || '—', 40)}
        </small>
      </td>

      {/* Действия */}
      <td>
        <div className="d-flex gap-1">
          <Button
            size="sm"
            variant="outline-primary"
            onClick={() => onEdit(car)}
          >
            <Pencil size={12} />
          </Button>
          <Button
            size="sm"
            variant="outline-danger"
            onClick={() => onDelete(car.id)}
          >
            <Trash size={12} />
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default TableRow;