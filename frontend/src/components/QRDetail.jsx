import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/QRDetail.css';
import { FaArrowLeft } from 'react-icons/fa';

const QRDetail = ({ qrId, onBack }) => {
  const params = useParams();
  const navigate = useNavigate();
  const id = qrId || params?.id;
  const [qrDetail, setQrDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQRDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Debe iniciar sesión para ver los detalles');
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:5000/api/qr/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error al obtener los detalles del QR');
        }

        setQrDetail(data.data);
      } catch (err) {
        setError(err.message);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQRDetail();
  }, [id]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/history');
    }
  };

  const handleDownload = () => {
    if (qrDetail && qrDetail.imageUrl) {
      const link = document.createElement('a');
      link.href = qrDetail.imageUrl;
      link.download = `qrcode-${qrDetail._id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Función para determinar el tipo de QR y mostrar información relevante
  const renderQRTypeInfo = () => {
    if (!qrDetail) return null;
    
    // Determinar el tipo de QR basado en el campo qrType o el contenido
    const qrType = qrDetail.qrType || 'text';
    const content = qrDetail.text || '';
    
    switch(qrType) {
      case 'vcard':
        // Extraer información de vCard
        const vcardInfo = {};
        content.split('\n').forEach(line => {
          if (line.startsWith('N:')) vcardInfo.name = line.substring(2);
          if (line.startsWith('TEL:')) vcardInfo.phone = line.substring(4);
          if (line.startsWith('EMAIL:')) vcardInfo.email = line.substring(6);
          if (line.startsWith('ORG:')) vcardInfo.company = line.substring(4);
          if (line.startsWith('TITLE:')) vcardInfo.title = line.substring(6);
          if (line.startsWith('URL:')) vcardInfo.website = line.substring(4);
          if (line.startsWith('ADR:')) vcardInfo.address = line.substring(4);
        });
        
        return (
          <>
            <div className="info-group">
              <label>Tipo de QR:</label>
              <p>Tarjeta de Contacto (vCard)</p>
            </div>
            {vcardInfo.name && (
              <div className="info-group">
                <label>Nombre:</label>
                <p>{vcardInfo.name}</p>
              </div>
            )}
            {vcardInfo.phone && (
              <div className="info-group">
                <label>Teléfono:</label>
                <p>{vcardInfo.phone}</p>
              </div>
            )}
            {vcardInfo.email && (
              <div className="info-group">
                <label>Correo electrónico:</label>
                <p>{vcardInfo.email}</p>
              </div>
            )}
            {vcardInfo.company && (
              <div className="info-group">
                <label>Empresa:</label>
                <p>{vcardInfo.company}</p>
              </div>
            )}
            {vcardInfo.title && (
              <div className="info-group">
                <label>Cargo:</label>
                <p>{vcardInfo.title}</p>
              </div>
            )}
            {vcardInfo.website && (
              <div className="info-group">
                <label>Sitio web:</label>
                <p>{vcardInfo.website}</p>
              </div>
            )}
            {vcardInfo.address && (
              <div className="info-group">
                <label>Dirección:</label>
                <p>{vcardInfo.address}</p>
              </div>
            )}
          </>
        );
        
      case 'wifi':
        // Extraer información de WiFi
        const wifiMatch = content.match(/WIFI:S:(.*?);T:(.*?);P:(.*?);;/);
        if (wifiMatch) {
          const [, ssid, encryption, password] = wifiMatch;
          return (
            <>
              <div className="info-group">
                <label>Tipo de QR:</label>
                <p>Red WiFi</p>
              </div>
              <div className="info-group">
                <label>Nombre de la red (SSID):</label>
                <p>{ssid}</p>
              </div>
              <div className="info-group">
                <label>Tipo de seguridad:</label>
                <p>{encryption}</p>
              </div>
              <div className="info-group">
                <label>Contraseña:</label>
                <p>{password}</p>
              </div>
            </>
          );
        }
        break;
        
      case 'email':
        // Extraer información de correo electrónico
        const emailMatch = content.match(/mailto:(.*?)\?subject=(.*?)&body=(.*)/i);
        if (emailMatch) {
          const [, email, subject, body] = emailMatch;
          return (
            <>
              <div className="info-group">
                <label>Tipo de QR:</label>
                <p>Correo Electrónico</p>
              </div>
              <div className="info-group">
                <label>Dirección de correo:</label>
                <p>{decodeURIComponent(email)}</p>
              </div>
              <div className="info-group">
                <label>Asunto:</label>
                <p>{decodeURIComponent(subject)}</p>
              </div>
              <div className="info-group">
                <label>Mensaje:</label>
                <p className="qr-text">{decodeURIComponent(body)}</p>
              </div>
            </>
          );
        }
        break;
        
      case 'sms':
        // Extraer información de SMS
        const smsMatch = content.match(/sms:(.*?)\?body=(.*)/i);
        if (smsMatch) {
          const [, number, message] = smsMatch;
          return (
            <>
              <div className="info-group">
                <label>Tipo de QR:</label>
                <p>SMS</p>
              </div>
              <div className="info-group">
                <label>Número de teléfono:</label>
                <p>{number}</p>
              </div>
              <div className="info-group">
                <label>Mensaje:</label>
                <p className="qr-text">{decodeURIComponent(message)}</p>
              </div>
            </>
          );
        }
        break;
        
      case 'geo':
        // Extraer información de ubicación geográfica
        const geoMatch = content.match(/geo:(.*?),(.*)/i);
        if (geoMatch) {
          const [, latitude, longitude] = geoMatch;
          return (
            <>
              <div className="info-group">
                <label>Tipo de QR:</label>
                <p>Ubicación Geográfica</p>
              </div>
              <div className="info-group">
                <label>Latitud:</label>
                <p>{latitude}</p>
              </div>
              <div className="info-group">
                <label>Longitud:</label>
                <p>{longitude}</p>
              </div>
              <div className="info-group">
                <label>Ver en mapa:</label>
                <p>
                  <a 
                    href={`https://www.google.com/maps?q=${latitude},${longitude}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="map-link"
                  >
                    Abrir en Google Maps
                  </a>
                </p>
              </div>
            </>
          );
        }
        break;
        
      case 'event':
        // Extraer información de evento
        const eventInfo = {};
        if (content.includes('BEGIN:VEVENT')) {
          content.split('\n').forEach(line => {
            if (line.startsWith('SUMMARY:')) eventInfo.title = line.substring(8);
            if (line.startsWith('LOCATION:')) eventInfo.location = line.substring(9);
            if (line.startsWith('DESCRIPTION:')) eventInfo.description = line.substring(12);
            if (line.startsWith('DTSTART:')) {
              const dateStr = line.substring(8);
              if (dateStr) {
                const year = dateStr.substring(0, 4);
                const month = dateStr.substring(4, 6);
                const day = dateStr.substring(6, 8);
                const hour = dateStr.substring(9, 11) || '00';
                const minute = dateStr.substring(11, 13) || '00';
                eventInfo.start = `${year}-${month}-${day} ${hour}:${minute}`;
              }
            }
            if (line.startsWith('DTEND:')) {
              const dateStr = line.substring(6);
              if (dateStr) {
                const year = dateStr.substring(0, 4);
                const month = dateStr.substring(4, 6);
                const day = dateStr.substring(6, 8);
                const hour = dateStr.substring(9, 11) || '00';
                const minute = dateStr.substring(11, 13) || '00';
                eventInfo.end = `${year}-${month}-${day} ${hour}:${minute}`;
              }
            }
          });
          
          return (
            <>
              <div className="info-group">
                <label>Tipo de QR:</label>
                <p>Evento</p>
              </div>
              {eventInfo.title && (
                <div className="info-group">
                  <label>Título:</label>
                  <p>{eventInfo.title}</p>
                </div>
              )}
              {eventInfo.location && (
                <div className="info-group">
                  <label>Ubicación:</label>
                  <p>{eventInfo.location}</p>
                </div>
              )}
              {eventInfo.description && (
                <div className="info-group">
                  <label>Descripción:</label>
                  <p className="qr-text">{eventInfo.description}</p>
                </div>
              )}
              {eventInfo.start && (
                <div className="info-group">
                  <label>Fecha de inicio:</label>
                  <p>{eventInfo.start}</p>
                </div>
              )}
              {eventInfo.end && (
                <div className="info-group">
                  <label>Fecha de fin:</label>
                  <p>{eventInfo.end}</p>
                </div>
              )}
            </>
          );
        }
        break;
        
      case 'url':
        return (
          <>
            <div className="info-group">
              <label>Tipo de QR:</label>
              <p>URL</p>
            </div>
            <div className="info-group">
              <label>Enlace:</label>
              <p className="qr-text">
                <a href={content} target="_blank" rel="noopener noreferrer">{content}</a>
              </p>
            </div>
          </>
        );
        
      case 'text':
      default:
        return (
          <>
            <div className="info-group">
              <label>Tipo de QR:</label>
              <p>Texto</p>
            </div>
            <div className="info-group">
              <label>Contenido:</label>
              <p className="qr-text">{content}</p>
            </div>
          </>
        );
    }
    
    // Si no se pudo determinar el tipo específico, mostrar el contenido como texto
    return (
      <div className="info-group">
        <label>Contenido:</label>
        <p className="qr-text">{content}</p>
      </div>
    );
  };

  if (loading) {
    return <div className="qr-detail-loading">Cargando detalles...</div>;
  }

  if (error) {
    return (
      <div className="qr-detail">
        <button className="btn-back" onClick={handleBack}>
          <FaArrowLeft style={{ marginRight: '8px' }} /> Volver
        </button>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!qrDetail) {
    return (
      <div className="qr-detail">
        <button className="btn-back" onClick={handleBack}>
          <FaArrowLeft style={{ marginRight: '8px' }} /> Volver
        </button>
        <div className="no-detail">No se encontraron detalles para este código QR</div>
      </div>
    );
  }

  return (
    <div className="qr-detail">
      <button className="btn-back" onClick={handleBack}>
        <FaArrowLeft style={{ marginRight: '8px' }} /> Volver
      </button>

      <div className="qr-detail-content">
        <div className="qr-detail-image">
          <img src={qrDetail.imageUrl} alt="Código QR" />
        </div>

        <div className="qr-detail-info">
          <h2>Detalles del Código QR</h2>

          {renderQRTypeInfo()}

          <div className="info-group">
            <label>Fecha de creación:</label>
            <p>{new Date(qrDetail.createdAt).toLocaleString()}</p>
          </div>

          <div className="info-group">
            <label>Color:</label>
            <p style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ 
                display: 'inline-block', 
                width: '20px', 
                height: '20px', 
                backgroundColor: qrDetail.color,
                marginRight: '10px',
                border: '1px solid #ddd'
              }}></span>
              {qrDetail.color}
            </p>
          </div>

          <div className="info-group">
            <label>Color de fondo:</label>
            <p style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ 
                display: 'inline-block', 
                width: '20px', 
                height: '20px', 
                backgroundColor: qrDetail.backgroundColor,
                marginRight: '10px',
                border: '1px solid #ddd'
              }}></span>
              {qrDetail.backgroundColor}
            </p>
          </div>

          <div className="info-group">
            <label>Tamaño:</label>
            <p>{qrDetail.size}px</p>
          </div>

          <div className="info-group">
            <label>Margen:</label>
            <p>{qrDetail.margin}</p>
          </div>

          {qrDetail.logoUrl && (
            <div className="info-group">
              <label>Logo:</label>
              <div className="logo-preview">
                <img src={qrDetail.logoUrl} alt="Logo" />
              </div>
            </div>
          )}

          <div className="qr-detail-actions">
            <button className="btn-download" onClick={handleDownload}>
              Descargar QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRDetail;