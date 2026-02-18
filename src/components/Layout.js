import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Sidebar from './Sidebar';

import { useAuth } from '../auth/AuthContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Container fluid className="p-0 overflow-hidden">
      <Row className="g-0" style={{ minHeight: '100vh' }}>
        {isAuthenticated && !isMobile && (
          <Col 
            xs="auto" 
            className="p-0 position-relative"
            style={{ 
              minWidth: sidebarOpen ? '250px' : '80px',
              transition: 'min-width 0.3s ease',
              zIndex: 1000
            }}>
            <Sidebar 
              isOpen={sidebarOpen} 
              toggleSidebar={toggleSidebar} 
              isMobile={isMobile}
            />
          </Col>
        )}
        <Col
            className="p-0"
            style={{ 
              //flex: '1 1 auto',
              minWidth: '0', // Важно для предотвращения переполнения
              paddingBottom: isMobile ? '60px' : 0 // оставляем место под нижнюю панель
            }} 
        >
          <div 
            style={{ 
              padding: '1rem',
              minHeight: '100vh',
              backgroundColor: '#f8f9fa9a'
            }}
          >
            {children}
          </div>
        </Col>
      </Row>
      {isAuthenticated && isMobile && (
        <Sidebar isMobile={isMobile} />
      )}
    </Container>
  );
};

export default Layout;