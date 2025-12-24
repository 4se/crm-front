import React from 'react';
import { Nav, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  House, Person, CarFront, List, ArrowLeft 
} from 'react-bootstrap-icons';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/cars', icon: CarFront, label: 'Транспортные средства' },
    { path: '/buildings', icon: House, label: 'Строения' },
    { path: '/employes', icon: Person, label: 'Сотрудники' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return ( 
    <div style={{ 
      height: '100vh', 
      backgroundColor: '#d2d2d2ff', 
      borderRight: '1px solid #dee2e6', 
      padding: isOpen ? '1rem' : '0.25rem',
      width: isOpen ? '250px' : '60px',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: isOpen ? 'stretch' : 'center'
    }}> 
      {/* Кнопка сворачивания с логотипом */}
      <div className="mb-3" style={{ 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: isOpen ? 'space-between' : 'center' // Меняем выравнивание
      }}> 
        {/* Логотип - показывается только когда сайдбар открыт */}
        {isOpen && (
          <div className="d-flex align-items-center">
            <img
              src="/RTS.png"
              alt="Логотип"
              style={{
                width: '150px',
                height: '50px',
                objectFit: 'contain'
              }}
            />
          </div>
        )}
        
        <Button 
          variant="outline-secondary" 
          size="sm" 
          onClick={toggleSidebar} 
          style={{ 
            border: 'none', 
            padding: isOpen ? '6px 12px' : '8px',
            width: isOpen ? 'auto' : '32px',
            height: isOpen ? 'auto' : '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: isOpen ? 'auto' : '0' // Сдвигаем кнопку вправо когда есть логотип
          }} 
        > 
          {isOpen ? <ArrowLeft size={20} /> : <List size={20} />} 
        </Button> 
      </div> 

      {/* Меню */}
      <Nav className="flex-column" style={{ width: '100%' }}> 
        {menuItems.map((item, index) => ( 
          <Nav.Item key={index}> 
            <Button 
              variant={isActive(item.path) ? 'primary' : 'outline-light'} 
              className={`d-flex align-items-center mb-2 p-2 border-0 ${isOpen ? 'justify-content-start' : 'justify-content-center'}`}
              style={{ 
                backgroundColor: isActive(item.path) ? '#ff9900ff' : 'transparent', 
                color: isActive(item.path) ? 'white' : '#495057',
                width: '100%',
                minHeight: '40px',
                padding: isOpen ? '0.5rem' : '0.25rem'
              }} 
              onClick={() => handleNavigation(item.path)} 
            > 
              <item.icon className={isOpen ? "me-2" : ""} size={20} /> 
              {isOpen && <span>{item.label}</span>} 
            </Button> 
          </Nav.Item> 
        ))} 
      </Nav> 
    </div> 
  ); 
}; 

export default Sidebar;