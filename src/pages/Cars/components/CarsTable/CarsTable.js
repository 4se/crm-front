import React from 'react';
import { Table, Card } from 'react-bootstrap';
import TableRow from './TableRow';

const CarsTable = ({ cars, onEdit, onDelete }) => {
  const tableMaxHeight = 'calc(100vh - 200px)';

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
          <Table responsive hover className="mb-0" style={{ minWidth: '1200px' }}>
            <thead className="bg-light" style={{ position: 'sticky', top: 0 }}>
              <tr>
                <th width="120">Гаражный №</th>
                <th width="120">Тип ТС</th>
                <th width="180">Модель ТС</th>
                <th width="140">Местоположение</th>
                <th width="130">Последнее ТО</th>
                <th width="130">Следующее ТО</th>
                <th width="220">Типы АСПТ</th>
                <th width="160">Состояние АСПТ</th>
                <th width="200">Комментарий</th>
                <th width="120">Действия</th>
              </tr>
            </thead>

            <tbody>
              {cars.length ? (
                cars.map(car => (
                  <TableRow
                    key={car.id}
                    car={car}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-4 text-muted">
                    Нет данных
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CarsTable;