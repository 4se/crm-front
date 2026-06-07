import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, ListGroup, Badge } from 'react-bootstrap';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCarData } from '../Cars/utils/testDataHelper';

const Account = () => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState(user?.password || '');
  const [notifications, setNotifications] = useState([]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!username || !password) {
      return;
    }
    login(username, password); // переустанавливаем user
    alert('Данные сохранены');
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user) {
        if (mounted) setNotifications([]);
        return;
      }
      try {
        const cars = await getCarData(user);
        if (!mounted) return;
        const today = new Date();
        const items = (cars || []).map(car => {
          const next = car.next_to_date ? new Date(car.next_to_date) : null;
          const daysLeft = next ? Math.ceil((next - today) / (1000 * 60 * 60 * 24)) : null;
          return {
            id: car.id,
            garage_number: car.garage_number,
            model: car.ts_model?.value || '',
            next_to_date: car.next_to_date,
            daysLeft
          };
        }).filter(i => i.daysLeft !== null && i.daysLeft <= 7);

        setNotifications(items);
      } catch (err) {
        console.error('Ошибка загрузки/обработки уведомлений ТО:', err);
        if (mounted) setNotifications([]);
      }
    };

    load();
    return () => { mounted = false; };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container style={{ maxWidth: '1100px' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ width: 480 }}>
          {notifications.length > 0 && (
            <Card>
              <Card.Body>
                <h5 className="mb-3">Уведомления по ТО</h5>
                <ListGroup variant="flush">
                  {notifications.map(n => (
                    <ListGroup.Item key={n.id} className="d-flex justify-content-between align-items-start" style={{ whiteSpace: 'nowrap' }}>
                      <div>
                        <div><strong>ТС {n.garage_number}</strong> {n.model}</div>
                        <div>Следующее ТО: {n.next_to_date}</div>
                      </div>
                      <Badge bg={n.daysLeft < 0 ? 'danger' : 'primary'} pill>
                        {n.daysLeft < 0 ? `Просрочено ${Math.abs(n.daysLeft)} д.` : `${n.daysLeft} д.`}
                      </Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <Card>
            <Card.Body>
              <h2 className="mb-4">Мой кабинет</h2>
              <div className="mb-3 d-flex align-items-center">
                <img
                  src={user?.avatarUrl}
                  alt="avatar"
                  style={{ width: '80px', height: '80px', borderRadius: '50%' }}
                />
                <div className="ms-3">
                  <p className="mb-1"><strong>Пользователь:</strong> {user?.username}</p>
                </div>
              </div>

              <Form onSubmit={handleSave}>
                <Form.Group className="mb-3" controlId="formUsername">
                  <Form.Label>Имя пользователя</Form.Label>
                  <Form.Control
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label>Пароль</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="me-2">
                  Сохранить
                </Button>
                <Button variant="outline-danger" onClick={handleLogout}>
                  Выйти
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default Account;
