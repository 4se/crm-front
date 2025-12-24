
import React from 'react';
import { Badge } from 'react-bootstrap';
import { getStatusColor } from '../../utils/carHelpers';

const StatusBadge = ({ status }) => {
  return (
    <Badge bg={getStatusColor(status)}>
      {status}
    </Badge>
  );
};

export default StatusBadge;