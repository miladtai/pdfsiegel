import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Row, Col, Navbar, Nav } from 'react-bootstrap';
import axios from 'axios';

// Components
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import PDFSign from './components/PDFSign';
import SignatureVerify from './components/SignatureVerify';
import LoadingSpinner from './components/LoadingSpinner';

// API Configuration
axios.defaults.baseURL = 'http://localhost:8888/pdfsiegel/backend';
axios.defaults.withCredentials = true;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sign');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/auth.php');
      if (response.data.authenticated) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.log('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await axios.delete('/api/auth.php');
      setUser(null);
      setActiveTab('sign');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="App">
        {/* Skip Link für Barrierefreiheit */}
        <a href="#main-content" className="skip-link">
          Zum Hauptinhalt springen
        </a>
        
        {/* Header */}
        <Navbar className="header-kl" expand="lg" role="banner">
          <Container fluid>
            <Navbar.Brand href="#home" className="logo-container">
              <div className="d-flex align-items-center">
                {/* Echtes Kaiserslautern Logo */}
                <img 
                  src="/kaiserslautern-logo-real.svg" 
                  alt="Stadt Kaiserslautern" 
                  style={{
                    height: '50px',
                    width: 'auto',
                    filter: 'brightness(0) invert(1)'
                  }}
                  className="me-3"
                />
                
                {/* PDFSeal Branding */}
                <div>
                  <div className="d-flex align-items-center">
                    <svg width="30" height="30" viewBox="0 0 40 40" fill="currentColor" className="me-2">
                      <rect x="5" y="5" width="30" height="30" rx="3" fill="white"/>
                      <path d="M15 12h10v2H15v-2zm0 4h10v2H15v-2zm0 4h6v2h-6v-2z" fill="currentColor"/>
                      <circle cx="30" cy="30" r="8" fill="#10b981"/>
                      <path d="M26 30l2 2 6-6" stroke="white" strokeWidth="2" fill="none"/>
                    </svg>
                    <div className="logo-text">PDFSeal</div>
                  </div>
                  <div style={{fontSize: '0.8rem', opacity: 0.9}}>Stadt Kaiserslautern</div>
                </div>
              </div>
            </Navbar.Brand>
            
            <Nav className="ms-auto">
              <Nav.Link 
                href="#" 
                onClick={handleLogout}
                className="text-white"
                aria-label="Abmelden"
              >
                Abmelden ({user.firstname} {user.lastname})
              </Nav.Link>
            </Nav>
          </Container>
        </Navbar>

        <Container fluid>
          <Row>
            {/* Sidebar */}
            <Col md={3} lg={2} className="p-0">
              <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            </Col>
            
            {/* Main Content */}
            <Col md={9} lg={10}>
              <main id="main-content" className="main-content" role="main">
                <Routes>
                  <Route path="/" element={<Navigate to="/sign" replace />} />
                  <Route 
                    path="/sign" 
                    element={<PDFSign user={user} active={activeTab === 'sign'} />} 
                  />
                  <Route 
                    path="/verify" 
                    element={<SignatureVerify active={activeTab === 'verify'} />} 
                  />
                </Routes>
              </main>
            </Col>
          </Row>
        </Container>
      </div>
    </Router>
  );
}

export default App;
