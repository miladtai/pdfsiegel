import React from 'react';
import { Container, Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ message = 'Laden...' }) => {
  return (
    <Container fluid className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="text-center">
        <Spinner 
          animation="border" 
          variant="danger" 
          className="spinner-kl mb-3"
          role="status"
          aria-label="Inhalt wird geladen"
        >
          <span className="sr-only">Laden...</span>
        </Spinner>
        <div className="text-muted">{message}</div>
      </div>
    </Container>
  );
};

export default LoadingSpinner;
