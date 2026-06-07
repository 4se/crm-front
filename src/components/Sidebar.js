import React, { useState, useEffect } from 'react';
import { Nav, Button, Image } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  House, Person, CarFront, List, ArrowLeft 
} from 'react-bootstrap-icons';
import { useAuth } from '../auth/AuthContext';
import { Badge } from 'react-bootstrap';
import { getCarData } from '../pages/Cars/utils/testDataHelper';

const Sidebar = ({ isOpen, toggleSidebar, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();

  const [hasOverdue, setHasOverdue] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user) {
        if (mounted) setHasOverdue(false);
        return;
      }
      try {
        const cars = await getCarData(user);
        if (!mounted) return;
        const today = new Date();
        const overdue = (cars || []).some(car => {
          if (!car.next_to_date) return false;
          const next = new Date(car.next_to_date);
          return (next - today) < 0;
        });
        setHasOverdue(!!overdue);
      } catch (err) {
        console.error('Ошибка проверки просроченных ТО в сайдбаре:', err);
        if (mounted) setHasOverdue(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [user]);

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

  if (isMobile) {
    // bottom navigation bar - replicate sidebar buttons with labels
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '70px',
          backgroundColor: '#d2d2d2ff',
          borderTop: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 1000
        }}
      >
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Button
              key={idx}
              variant=""
              onClick={() => handleNavigation(item.path)}
              className="d-flex align-items-center justify-content-center"
              style={{
                padding: '0.25rem',
                minWidth: '60px',
                backgroundColor: active ? '#ff9900ff' : 'transparent',
                border: 'none'
              }}
            >
              <Icon size={24} color={active ? 'white' : '#495057'} />
            </Button>
          );
        })}
        {user && (
          <Button
            variant=""
            onClick={() => handleNavigation('/account')}
            className="d-flex align-items-center justify-content-center"
            style={{
              padding: '0.25rem',
              minWidth: '60px',
              backgroundColor: isActive('/account') ? '#ff9900ff' : 'transparent',
              border: 'none'
            }}
          >
            <Image
              src={user.avatarUrl}
              roundedCircle
              style={{ width: 24, height: 24, border: isActive('/account') ? '1px solid white' : 'none' }}
            />
          </Button>
        )}
      </div>
    );
  }

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

      {/* профиль пользователя - располагается внизу */}
      {user && (
        <Nav className="flex-column mt-auto" style={{ width: '100%' }}>
          <Nav.Item>
            <Button
              variant={isActive('/account') ? 'primary' : 'outline-light'}
              className={`d-flex align-items-center mb-2 p-2 border-0 ${isOpen ? 'justify-content-start' : 'justify-content-center'}`}
              style={{
                backgroundColor: isActive('/account') ? '#ff9900ff' : 'transparent',
                color: isActive('/account') ? 'white' : '#495057',
                width: '100%',
                minHeight: '40px',
                padding: isOpen ? '0.5rem' : '0.25rem'
              }}
              onClick={() => handleNavigation('/account')}
            >
              <Image
                src={user.avatarUrl}
                roundedCircle
                style={{ width: 20, height: 20 }}
                className={isOpen ? 'me-2' : ''}
              />
              {isOpen && <span>Мой кабинет</span>}
              {hasOverdue && isOpen && (
                <Badge bg="danger" pill style={{ marginLeft: '8px' }}>!</Badge>
              )}
              {hasOverdue && !isOpen && (
                <span style={{ width: 10, height: 10, background: 'red', borderRadius: '50%', display: 'inline-block', marginLeft: 6 }} />
              )}
            </Button>
          </Nav.Item>
        </Nav>
      )}
    </div> 
  ); 
}; 

export default Sidebar;