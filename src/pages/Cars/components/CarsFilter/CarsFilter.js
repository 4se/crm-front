import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { Plus, CarFront } from 'react-bootstrap-icons';

const CarsFilter = ({ activeView, onViewChange, onAddCar }) => {
  return (
    <Navbar bg="white" expand="lg" className="shadow-sm" style={{ margin: '12px 12px 0 12px' }}>
      {/* Убираем Container fluid и задаем стили напрямую */}
      <div style={{ width: '100%', padding: '0 12px' }}>
        <Navbar.Brand className="d-flex align-items-center">
          <CarFront className="me-2" size={24} />
          Транспортные средства
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              active={activeView === 'all'}
              onClick={() => onViewChange('all')}
              style={{ cursor: 'pointer' }}
            >
              Все записи
            </Nav.Link>
            <Nav.Link 
              active={activeView === 'working'}
              onClick={() => onViewChange('working')}
              style={{ cursor: 'pointer' }}
            >
              Исправные системы
            </Nav.Link>
            <Nav.Link 
              active={activeView === 'repair'}
              onClick={() => onViewChange('repair')}
              style={{ cursor: 'pointer' }}
            >
              Требуют ремонта
            </Nav.Link>
          </Nav>
          
          <Button 
            variant="primary" 
            onClick={onAddCar}
            className="d-flex align-items-center"
          >
            <Plus className="me-2" />
            Добавить запись
          </Button>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
};

export default CarsFilter;