import { useState, useEffect } from 'react';
import '../styles/Auth.css';
import Login from './Login';
import Register from './Register';

const AuthModal = ({ isOpen, onClose, initialView = 'login' }) => {
  const [currentView, setCurrentView] = useState(initialView);
  
  // Actualizar currentView cuando cambia initialView
  useEffect(() => {
    setCurrentView(initialView);
  }, [initialView]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal">
        <button className="close-modal" onClick={onClose}>
          &times;
        </button>
        
        {currentView === 'login' ? (
          <Login 
            onClose={onClose} 
            switchToRegister={() => setCurrentView('register')} 
          />
        ) : (
          <Register 
            onClose={onClose} 
            switchToLogin={() => setCurrentView('login')} 
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;