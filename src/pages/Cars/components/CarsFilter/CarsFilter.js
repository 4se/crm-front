import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { Plus, CarFront } from 'react-bootstrap-icons';

const CarsFilter = ({ activeView, onViewChange, onAddCar, searchTerm, onSearchChange }) => {
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
          </Nav>

          {/* поиск */}
          <div className="d-flex align-items-center me-2" style={{ minWidth: '200px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Поиск..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
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