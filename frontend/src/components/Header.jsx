import { useState } from 'react';
import '../styles/Header.css';

const Header = ({ activeTab, setActiveTab }) => {
  return (
    <header className="header">
      <div className="logo">
        <h1>QR Generator</h1>
      </div>
      <nav className="nav">
        <ul>
          <li>
            <button 
              className={activeTab === 'generator' ? 'active' : ''}
              onClick={() => setActiveTab('generator')}
            >
              Generar QR
            </button>
          </li>
          <li>
            <button 
              className={activeTab === 'history' ? 'active' : ''}
              onClick={() => setActiveTab('history')}
            >
              Historial
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;