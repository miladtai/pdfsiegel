import React from 'react';
import { Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();

  const handleTabClick = (tab, path) => {
    onTabChange(tab);
    navigate(path);
  };

  return (
    <nav className="sidebar" role="navigation" aria-label="Hauptnavigation">      
      <Nav className="flex-column">
        <Nav.Link
          href="#"
          className={activeTab === 'sign' ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            handleTabClick('sign', '/sign');
          }}
          aria-current={activeTab === 'sign' ? 'page' : undefined}
        >
          <div className="d-flex align-items-center">
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              className="me-3"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
              <circle cx="18" cy="18" r="3" fill="#10b981"/>
              <path d="M16.5 18l1 1 2-2" stroke="white" strokeWidth="1.5" fill="none"/>
            </svg>
            <span>PDF signieren</span>
          </div>
        </Nav.Link>

        <Nav.Link
          href="#"
          className={activeTab === 'verify' ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            handleTabClick('verify', '/verify');
          }}
          aria-current={activeTab === 'verify' ? 'page' : undefined}
        >
          <div className="d-flex align-items-center">
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              className="me-3"
              aria-hidden="true"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>Signaturen prüfen</span>
          </div>
        </Nav.Link>
      </Nav>

      <div className="mt-5 pt-4 border-top">
        <div className="text-muted small">
          <div className="mb-2">
            <strong>Hilfe & Support</strong>
          </div>
          <div className="mb-1">
            Tel: 0631/365-1632
          </div>
          <div>
            E-Mail: support@kaiserslautern.de
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
