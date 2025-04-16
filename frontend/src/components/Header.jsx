import { useState, useEffect } from 'react';
import '../styles/Header.css';
import AuthModal from './AuthModal';

const Header = ({ activeTab, setActiveTab }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Verificar si el usuario está autenticado al cargar el componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const openLoginModal = () => {
    setAuthModalView('login');
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalView('register');
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setShowUserMenu(false);
    window.location.reload();
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <header className="header">
      <div className="logo">
        <h1>QR Generator</h1>
      </div>
      <div className="header-content">
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
        
        {isLoggedIn ? (
          <div className="user-menu">
            <div className="user-info" onClick={toggleUserMenu}>
              <div className="user-avatar">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span>{user?.username}</span>
            </div>
            
            {showUserMenu && (
              <div className="user-dropdown">
                <button onClick={handleLogout} className="logout-button">
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="header-auth-buttons">
            <button className="btn-login" onClick={openLoginModal}>
              Iniciar Sesión
            </button>
            <button className="btn-register" onClick={openRegisterModal}>
              Registrarse
            </button>
          </div>
        )}
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialView={authModalView} 
      />
    </header>
  );
};

export default Header;