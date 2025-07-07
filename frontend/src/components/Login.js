import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth.php', credentials);
      if (response.data.success) {
        onLogin(response.data.user);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Anmeldung fehlgeschlagen';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page bg-light min-vh-100">
      {/* Header mit linksbündigem Kaiserslautern Logo */}
      <div className="header-kl py-3">
        <Container>
          <div className="d-flex align-items-center">
            {/* Offizielles Kaiserslautern Logo - linksbündig */}
            <img 
              src="/kaiserslautern-logo-real.svg" 
              alt="Stadt Kaiserslautern Logo" 
              style={{
                height: '60px',
                width: 'auto'
              }}
            />
          </div>
        </Container>
      </div>

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <Card className="shadow border-0" style={{borderRadius: '1rem'}}>
              <Card.Body className="p-5">
                {/* PDFSeal Logo im Login-Bereich */}
                <div className="text-center mb-4">
                  <div className="d-flex align-items-center justify-content-center mb-3">
                    <svg width="50" height="50" viewBox="0 0 40 40" fill="currentColor" className="me-3" style={{color: '#dc2626'}}>
                      <rect x="5" y="5" width="30" height="30" rx="3" fill="#dc2626"/>
                      <path d="M15 12h10v2H15v-2zm0 4h10v2H15v-2zm0 4h6v2h-6v-2z" fill="white"/>
                      <circle cx="30" cy="30" r="8" fill="#10b981"/>
                      <path d="M26 30l2 2 6-6" stroke="white" strokeWidth="2" fill="none"/>
                    </svg>
                    <div className="logo-text" style={{fontSize: '2rem', fontWeight: 'bold', color: '#dc2626'}}>
                      PDFSeal
                    </div>
                  </div>
                  <div style={{fontSize: '1rem', color: '#dc2626', fontWeight: '500', marginBottom: '1rem'}}>
                    Sicher. Einfach. Signiert.
                  </div>
                  <h1 className="h4 mb-3" style={{color: '#374151', fontWeight: '600'}}>
                    Anmelden
                  </h1>
                  <p className="text-muted">
                    Melden Sie sich mit Ihren Active Directory Zugangsdaten an
                  </p>
                </div>

                {error && (
                  <Alert variant="danger" className="alert-kl-danger mb-4" role="alert">
                    <div className="d-flex align-items-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="me-2">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <div>
                        <strong>Fehler:</strong> {error}
                      </div>
                    </div>
                  </Alert>
                )}

                <Form onSubmit={handleSubmit} noValidate>
                  <Form.Group className="mb-4">
                    <Form.Label htmlFor="username" className="fw-semibold mb-2" style={{color: '#374151'}}>
                      AD Nummer
                    </Form.Label>
                    <Form.Control
                      id="username"
                      type="text"
                      name="username"
                      value={credentials.username}
                      onChange={handleChange}
                      placeholder="AD Nummer eingeben"
                      required
                      disabled={loading}
                      aria-describedby="username-help"
                      autoComplete="username"
                      size="lg"
                      style={{
                        borderRadius: '0.5rem',
                        border: '2px solid #e5e7eb',
                        padding: '0.75rem 1rem'
                      }}
                    />
                    <Form.Text id="username-help" className="text-muted mt-2">
                      Verwenden Sie Ihre Active Directory Nummer
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label htmlFor="password" className="fw-semibold mb-2" style={{color: '#374151'}}>
                      Passwort
                    </Form.Label>
                    <Form.Control
                      id="password"
                      type="password"
                      name="password"
                      value={credentials.password}
                      onChange={handleChange}
                      placeholder="Passwort eingeben"
                      required
                      disabled={loading}
                      autoComplete="current-password"
                      size="lg"
                      style={{
                        borderRadius: '0.5rem',
                        border: '2px solid #e5e7eb',
                        padding: '0.75rem 1rem'
                      }}
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    className="btn-kl-primary w-100 mb-4"
                    size="lg"
                    disabled={loading || !credentials.username || !credentials.password}
                    style={{
                      borderRadius: '0.5rem',
                      padding: '0.875rem 1rem',
                      fontWeight: '600',
                      fontSize: '1.1rem'
                    }}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        <span className="sr-only">Laden...</span>
                        Anmelden...
                      </>
                    ) : (
                      'Anmelden'
                    )}
                  </Button>
                </Form>

                {/* Demo-Hinweis für Entwicklung */}
                <div className="mt-4 p-4 rounded" style={{backgroundColor: '#f8fafc', border: '1px solid #e2e8f0'}}>
                  <div className="text-center">
                    <div className="fw-semibold text-muted mb-2" style={{fontSize: '0.9rem'}}>
                      Demo-Zugangsdaten
                    </div>
                    <div className="small text-muted">
                      <div className="mb-1">
                        <strong>Benutzername:</strong> admin, mchairman, user1
                      </div>
                      <div>
                        <strong>Passwort:</strong> password
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
