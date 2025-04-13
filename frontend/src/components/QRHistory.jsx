import { useState, useEffect } from 'react';
import '../styles/QRHistory.css';

const QRHistory = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar historial de códigos QR
  useEffect(() => {
    const fetchQRCodes = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/qr');
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
  }, []);

  // Eliminar un código QR
  const deleteQR = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este código QR?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/qr/${id}`, {
          method: 'DELETE'
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

  return (
    <div className="qr-history">
      <h2>Historial de Códigos QR</h2>
      
      {error && <div className="error">{error}</div>}
      
      {qrCodes.length === 0 ? (
        <div className="no-history">No hay códigos QR generados aún.</div>
      ) : (
        <div className="qr-grid">
          {qrCodes.map(qr => (
            <div key={qr._id} className="qr-item">
              <div className="qr-image">
                <img src={qr.imageUrl} alt={`Código QR para ${qr.text}`} />
              </div>
              <div className="qr-details">
                <p className="qr-text">{qr.text.length > 30 ? `${qr.text.substring(0, 30)}...` : qr.text}</p>
                <p className="qr-date">{new Date(qr.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="qr-actions">
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