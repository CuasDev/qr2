import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/QRHistory.css';
import AuthModal from './AuthModal';

const QRHistory = () => {
  const navigate = useNavigate();
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Verificar si el usuario está autenticado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Cargar historial de códigos QR
  useEffect(() => {
    // Si no está autenticado, no cargar los códigos QR
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const fetchQRCodes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/qr', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error al obtener el historial de códigos QR');
        }

        setQrCodes(data.data);
      } catch (err) {
        setError(err.message);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQRCodes();
  }, [isLoggedIn]);

  // Eliminar un código QR
  const deleteQR = async (id) => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    if (window.confirm('¿Estás seguro de que deseas eliminar este código QR?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/qr/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Error al eliminar el código QR');
        }

        // Actualizar la lista después de eliminar
        setQrCodes(qrCodes.filter(qr => qr._id !== id));
      } catch (err) {
        setError(err.message);
        console.error('Error:', err);
      }
    }
  };

  // Descargar código QR
  const downloadQR = (qrCode) => {
    if (qrCode && qrCode.imageUrl) {
      const link = document.createElement('a');
      link.href = qrCode.imageUrl;
      link.download = `qrcode-con-logo-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return <div className="qr-history-loading">Cargando historial...</div>;
  }
  
  // Si no está autenticado, mostrar mensaje
  if (!isLoggedIn) {
    return (
      <div className="qr-history">
        <h2>Historial de Códigos QR</h2>
        <div className="no-history">
          <p>Debes iniciar sesión para ver tu historial de códigos QR.</p>
          <button 
            className="btn-auth" 
            onClick={() => setIsAuthModalOpen(true)}
          >
            Iniciar Sesión
          </button>
        </div>
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          initialView="login" 
        />
      </div>
    );
  }

  // Función para navegar a la vista de detalles
  const viewQRDetail = (qrId) => {
    navigate(`/qr/${qrId}`);
  };

  return (
    <div className="qr-history">
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialView="login" 
      />
      <h2>Historial de Códigos QR</h2>
      
      {error && <div className="error">{error}</div>}
      
      {qrCodes.length === 0 ? (
        <div className="no-history">No hay códigos QR generados aún.</div>
      ) : (
        <div className="qr-grid">
          {qrCodes.map(qr => (
            <div key={qr._id} className="qr-item" onClick={() => viewQRDetail(qr._id)}>
              <div className="qr-image">
                <img src={qr.imageUrl} alt={`Código QR para ${qr.text}`} />
              </div>
              <div className="qr-details">
                <p className="qr-text">{qr.text.length > 30 ? `${qr.text.substring(0, 30)}...` : qr.text}</p>
                <p className="qr-date">{new Date(qr.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="qr-actions" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => downloadQR(qr)} 
                  className="btn-action btn-download"
                  title="Descargar"
                >
                  ⬇️
                </button>
                <button 
                  onClick={() => deleteQR(qr._id)} 
                  className="btn-action btn-delete"
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QRHistory;