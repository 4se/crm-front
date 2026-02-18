import React, { useState } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const Account = () => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState(user?.password || '');

  const handleSave = (e) => {
    e.preventDefault();
    if (!username || !password) {
      return;
    }
    login(username, password); // переустанавливаем user
    alert('Данные сохранены');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container style={{ maxWidth: '600px' }}>
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
    </Container>
  );
};

export default Account;
