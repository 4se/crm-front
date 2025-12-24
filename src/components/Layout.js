import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Container fluid className="p-0 overflow-hidden">
      <Row className="g-0" style={{ minHeight: '100vh' }}>
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
          />
        </Col>
        <Col
            className="p-0"
            style={{ 
              //flex: '1 1 auto',
              minWidth: '0' // Важно для предотвращения переполнения
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
    </Container>
  );
};

export default Layout;