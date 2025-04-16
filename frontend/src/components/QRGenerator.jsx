import { useState, useRef, useEffect } from 'react';
import '../styles/QRGenerator.css';
import QRCode from 'react-qr-code';
import AuthModal from './AuthModal';

const QRGenerator = () => {
  const [qrType, setQrType] = useState('text');
  const [formData, setFormData] = useState({
    text: '',
    color: '#000000',
    backgroundColor: '#FFFFFF',
    size: 300,
    margin: 4,
    // vCard fields
    vCardName: '',
    vCardPhone: '',
    vCardEmail: '',
    vCardCompany: '',
    vCardTitle: '',
    vCardWebsite: '',
    vCardAddress: '',
    // WiFi fields
    wifiSsid: '',
    wifiPassword: '',
    wifiEncryption: 'WPA',
    // Email fields
    emailAddress: '',
    emailSubject: '',
    emailBody: '',
    // SMS fields
    smsNumber: '',
    smsMessage: '',
    // Location fields
    latitude: '',
    longitude: '',
    // Event fields
    eventTitle: '',
    eventLocation: '',
    eventDescription: '',
    eventStartDate: '',
    eventEndDate: ''
  });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const qrCodeRef = useRef(null);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Manejar subida de logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Verificar si el usuario está autenticado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Función para generar el contenido del QR según el tipo seleccionado
  const generateQRContent = () => {
    switch(qrType) {
      case 'text':
        return formData.text;
      case 'url':
        return formData.text;
      case 'vcard':
        return `BEGIN:VCARD
VERSION:3.0
N:${formData.vCardName}
TEL:${formData.vCardPhone}
EMAIL:${formData.vCardEmail}
ORG:${formData.vCardCompany}
TITLE:${formData.vCardTitle}
URL:${formData.vCardWebsite}
ADR:${formData.vCardAddress}
END:VCARD`;
      case 'wifi':
        return `WIFI:S:${formData.wifiSsid};T:${formData.wifiEncryption};P:${formData.wifiPassword};;`;
      case 'email':
        return `mailto:${formData.emailAddress}?subject=${encodeURIComponent(formData.emailSubject)}&body=${encodeURIComponent(formData.emailBody)}`;
      case 'sms':
        return `sms:${formData.smsNumber}?body=${encodeURIComponent(formData.smsMessage)}`;
      case 'geo':
        return `geo:${formData.latitude},${formData.longitude}`;
      case 'event':
        const startDate = formData.eventStartDate ? new Date(formData.eventStartDate).toISOString().replace(/[-:]/g, '').replace(/\.[0-9]{3}/g, '') : '';
        const endDate = formData.eventEndDate ? new Date(formData.eventEndDate).toISOString().replace(/[-:]/g, '').replace(/\.[0-9]{3}/g, '') : '';
        return `BEGIN:VEVENT
SUMMARY:${formData.eventTitle}
LOCATION:${formData.eventLocation}
DESCRIPTION:${formData.eventDescription}
DTSTART:${startDate}
DTEND:${endDate}
END:VEVENT`;
      default:
        return formData.text;
    }
  };

  // Validar formulario según el tipo de QR
  const validateForm = () => {
    switch(qrType) {
      case 'text':
      case 'url':
        return formData.text ? true : 'Por favor ingrese un texto o URL';
      case 'vcard':
        return formData.vCardName ? true : 'Por favor ingrese al menos el nombre';
      case 'wifi':
        return formData.wifiSsid ? true : 'Por favor ingrese el nombre de la red WiFi';
      case 'email':
        return formData.emailAddress ? true : 'Por favor ingrese una dirección de correo';
      case 'sms':
        return formData.smsNumber ? true : 'Por favor ingrese un número de teléfono';
      case 'geo':
        return (formData.latitude && formData.longitude) ? true : 'Por favor ingrese latitud y longitud';
      case 'event':
        return formData.eventTitle ? true : 'Por favor ingrese el título del evento';
      default:
        return true;
    }
  };

  // Generar código QR con logo localmente
  const generateQR = async (e) => {
    e.preventDefault();
    
    // Verificar si el usuario está autenticado
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const validation = validateForm();
      if (validation !== true) {
        throw new Error(validation);
      }
      
      const qrContent = generateQRContent();

      // Obtener el elemento SVG del QR
      const qrCodeElement = qrCodeRef.current;
      if (!qrCodeElement) {
        throw new Error('No se pudo generar el código QR');
      }

      // Crear un canvas para convertir el SVG a imagen
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Configurar el tamaño del canvas
      canvas.width = formData.size;
      canvas.height = formData.size;
      
      // Dibujar el fondo
      ctx.fillStyle = formData.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Convertir el SVG a una imagen
      const svgData = new XMLSerializer().serializeToString(qrCodeElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      // Crear una imagen a partir del SVG
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = svgUrl;
      });
      
      // Calcular el tamaño y posición para centrar el QR con margen
      const marginSize = formData.margin * 10;
      const qrSize = formData.size - (marginSize * 2);
      ctx.drawImage(img, marginSize, marginSize, qrSize, qrSize);
      
      // Si hay logo, añadirlo al centro
      if (logoPreview) {
        const logoImg = new Image();
        await new Promise((resolve, reject) => {
          logoImg.onload = resolve;
          logoImg.onerror = reject;
          logoImg.src = logoPreview;
        });
        
        // Calcular posición y tamaño del logo
        const logoSize = qrSize / 4;
        const logoX = (canvas.width - logoSize) / 2;
        const logoY = (canvas.height - logoSize) / 2;
        
        // Crear un fondo blanco circular para el logo
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(logoX + (logoSize/2), logoY + (logoSize/2), logoSize/1.8, 0, Math.PI * 2);
        ctx.fill();
        
        // Dibujar el logo
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      }
      
      // Convertir canvas a URL de datos
      const qrDataUrl = canvas.toDataURL('image/png');
      
      // Liberar URL del objeto
      URL.revokeObjectURL(svgUrl);

      // Guardar en el backend
      const formDataToSend = new FormData();
      formDataToSend.append('text', qrContent);
      formDataToSend.append('qrType', qrType);
      formDataToSend.append('color', formData.color);
      formDataToSend.append('backgroundColor', formData.backgroundColor);
      formDataToSend.append('size', formData.size);
      formDataToSend.append('margin', formData.margin);
      formDataToSend.append('imageUrl', qrDataUrl);
      
      if (logo) {
        formDataToSend.append('logo', logo);
      }

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/qr', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar el código QR');
      }

      setQrCode({
        ...data.data,
        imageUrl: qrDataUrl
      });
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Descargar código QR
  const downloadQR = () => {
    if (qrCode && qrCode.imageUrl) {
      const link = document.createElement('a');
      link.href = qrCode.imageUrl;
      link.download = `qrcode-con-logo-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="qr-generator">
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialView="login" 
      />
      <h2>Generador de Códigos QR con Logo</h2>
      
      <div className="qr-container">
        <form onSubmit={generateQR} className="qr-form">
          <div className="form-group">
            <label htmlFor="qrType">Tipo de QR</label>
            <select
              id="qrType"
              name="qrType"
              value={qrType}
              onChange={(e) => setQrType(e.target.value)}
              className="select-input"
            >
              <option value="text">Texto</option>
              <option value="url">URL</option>
              <option value="vcard">Tarjeta de Contacto (vCard)</option>
              <option value="wifi">WiFi</option>
              <option value="email">Correo Electrónico</option>
              <option value="sms">SMS</option>
              <option value="geo">Ubicación Geográfica</option>
              <option value="event">Evento</option>
            </select>
          </div>

          {/* Campos específicos según el tipo de QR */}
          {qrType === 'text' && (
            <div className="form-group">
              <label htmlFor="text">Texto</label>
              <input
                type="text"
                id="text"
                name="text"
                value={formData.text}
                onChange={handleChange}
                placeholder="Ingrese texto"
                required
              />
            </div>
          )}

          {qrType === 'url' && (
            <div className="form-group">
              <label htmlFor="text">URL</label>
              <input
                type="url"
                id="text"
                name="text"
                value={formData.text}
                onChange={handleChange}
                placeholder="https://ejemplo.com"
                required
              />
            </div>
          )}

          {qrType === 'vcard' && (
            <>
              <div className="form-group">
                <label htmlFor="vCardName">Nombre</label>
                <input
                  type="text"
                  id="vCardName"
                  name="vCardName"
                  value={formData.vCardName}
                  onChange={handleChange}
                  placeholder="Nombre completo"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="vCardPhone">Teléfono</label>
                <input
                  type="tel"
                  id="vCardPhone"
                  name="vCardPhone"
                  value={formData.vCardPhone}
                  onChange={handleChange}
                  placeholder="Número de teléfono"
                />
              </div>
              <div className="form-group">
                <label htmlFor="vCardEmail">Correo electrónico</label>
                <input
                  type="email"
                  id="vCardEmail"
                  name="vCardEmail"
                  value={formData.vCardEmail}
                  onChange={handleChange}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className="form-group">
                <label htmlFor="vCardCompany">Empresa</label>
                <input
                  type="text"
                  id="vCardCompany"
                  name="vCardCompany"
                  value={formData.vCardCompany}
                  onChange={handleChange}
                  placeholder="Nombre de la empresa"
                />
              </div>
              <div className="form-group">
                <label htmlFor="vCardTitle">Cargo</label>
                <input
                  type="text"
                  id="vCardTitle"
                  name="vCardTitle"
                  value={formData.vCardTitle}
                  onChange={handleChange}
                  placeholder="Cargo o puesto"
                />
              </div>
              <div className="form-group">
                <label htmlFor="vCardWebsite">Sitio web</label>
                <input
                  type="url"
                  id="vCardWebsite"
                  name="vCardWebsite"
                  value={formData.vCardWebsite}
                  onChange={handleChange}
                  placeholder="https://ejemplo.com"
                />
              </div>
              <div className="form-group">
                <label htmlFor="vCardAddress">Dirección</label>
                <input
                  type="text"
                  id="vCardAddress"
                  name="vCardAddress"
                  value={formData.vCardAddress}
                  onChange={handleChange}
                  placeholder="Dirección completa"
                />
              </div>
            </>
          )}

          {qrType === 'wifi' && (
            <>
              <div className="form-group">
                <label htmlFor="wifiSsid">Nombre de la red (SSID)</label>
                <input
                  type="text"
                  id="wifiSsid"
                  name="wifiSsid"
                  value={formData.wifiSsid}
                  onChange={handleChange}
                  placeholder="Nombre de la red WiFi"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="wifiPassword">Contraseña</label>
                <input
                  type="text"
                  id="wifiPassword"
                  name="wifiPassword"
                  value={formData.wifiPassword}
                  onChange={handleChange}
                  placeholder="Contraseña de la red"
                />
              </div>
              <div className="form-group">
                <label htmlFor="wifiEncryption">Tipo de seguridad</label>
                <select
                  id="wifiEncryption"
                  name="wifiEncryption"
                  value={formData.wifiEncryption}
                  onChange={handleChange}
                  className="select-input"
                >
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">Sin contraseña</option>
                </select>
              </div>
            </>
          )}

          {qrType === 'email' && (
            <>
              <div className="form-group">
                <label htmlFor="emailAddress">Dirección de correo</label>
                <input
                  type="email"
                  id="emailAddress"
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleChange}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="emailSubject">Asunto</label>
                <input
                  type="text"
                  id="emailSubject"
                  name="emailSubject"
                  value={formData.emailSubject}
                  onChange={handleChange}
                  placeholder="Asunto del correo"
                />
              </div>
              <div className="form-group">
                <label htmlFor="emailBody">Mensaje</label>
                <textarea
                  id="emailBody"
                  name="emailBody"
                  value={formData.emailBody}
                  onChange={handleChange}
                  placeholder="Cuerpo del mensaje"
                  rows="4"
                ></textarea>
              </div>
            </>
          )}

          {qrType === 'sms' && (
            <>
              <div className="form-group">
                <label htmlFor="smsNumber">Número de teléfono</label>
                <input
                  type="tel"
                  id="smsNumber"
                  name="smsNumber"
                  value={formData.smsNumber}
                  onChange={handleChange}
                  placeholder="Número de teléfono"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="smsMessage">Mensaje</label>
                <textarea
                  id="smsMessage"
                  name="smsMessage"
                  value={formData.smsMessage}
                  onChange={handleChange}
                  placeholder="Mensaje de texto"
                  rows="4"
                ></textarea>
              </div>
            </>
          )}

          {qrType === 'geo' && (
            <>
              <div className="form-group">
                <label htmlFor="latitude">Latitud</label>
                <input
                  type="text"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="Ej: 40.7128"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="longitude">Longitud</label>
                <input
                  type="text"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="Ej: -74.0060"
                  required
                />
              </div>
            </>
          )}

          {qrType === 'event' && (
            <>
              <div className="form-group">
                <label htmlFor="eventTitle">Título del evento</label>
                <input
                  type="text"
                  id="eventTitle"
                  name="eventTitle"
                  value={formData.eventTitle}
                  onChange={handleChange}
                  placeholder="Título del evento"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="eventLocation">Ubicación</label>
                <input
                  type="text"
                  id="eventLocation"
                  name="eventLocation"
                  value={formData.eventLocation}
                  onChange={handleChange}
                  placeholder="Ubicación del evento"
                />
              </div>
              <div className="form-group">
                <label htmlFor="eventDescription">Descripción</label>
                <textarea
                  id="eventDescription"
                  name="eventDescription"
                  value={formData.eventDescription}
                  onChange={handleChange}
                  placeholder="Descripción del evento"
                  rows="3"
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="eventStartDate">Fecha de inicio</label>
                <input
                  type="datetime-local"
                  id="eventStartDate"
                  name="eventStartDate"
                  value={formData.eventStartDate}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="eventEndDate">Fecha de fin</label>
                <input
                  type="datetime-local"
                  id="eventEndDate"
                  name="eventEndDate"
                  value={formData.eventEndDate}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="logo">Logo (opcional)</label>
            <input
              type="file"
              id="logo"
              name="logo"
              onChange={handleLogoChange}
              accept="image/*"
            />
            {logoPreview && (
              <div className="logo-preview">
                <img src={logoPreview} alt="Vista previa del logo" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="color">Color del QR</label>
            <div className="color-input">
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
              />
              <span>{formData.color}</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="backgroundColor">Color de fondo</label>
            <div className="color-input">
              <input
                type="color"
                id="backgroundColor"
                name="backgroundColor"
                value={formData.backgroundColor}
                onChange={handleChange}
              />
              <span>{formData.backgroundColor}</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="size">Tamaño (px)</label>
            <input
              type="range"
              id="size"
              name="size"
              min="100"
              max="1000"
              step="50"
              value={formData.size}
              onChange={handleChange}
            />
            <span>{formData.size}px</span>
          </div>

          <div className="form-group">
            <label htmlFor="margin">Margen</label>
            <input
              type="range"
              id="margin"
              name="margin"
              min="0"
              max="10"
              value={formData.margin}
              onChange={handleChange}
            />
            <span>{formData.margin}</span>
          </div>

          <button type="submit" className="btn-generate" disabled={loading}>
            {loading ? 'Generando...' : 'Generar QR'}
          </button>
        </form>

        <div className="qr-result">
          {loading && <div className="loading">Generando código QR...</div>}
          
          {error && <div className="error">{error}</div>}
          
          <div className="qr-preview" style={{ display: 'block', marginBottom: '20px' }}>
            {validateForm() === true && (
              <div style={{ 
                background: formData.backgroundColor, 
                padding: `${formData.margin * 5}px`, 
                display: 'inline-block', 
                margin: '0 auto',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <QRCode
                  ref={qrCodeRef}
                  value={generateQRContent()}
                  size={formData.size / 2}
                  fgColor={formData.color}
                  bgColor={formData.backgroundColor}
                  level="H"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            )}
          </div>
          
          {qrCode && qrCode.imageUrl && (
            <div className="qr-code">
              <img src={qrCode.imageUrl} alt="Código QR generado" />
              <button onClick={downloadQR} className="btn-download">
                Descargar QR
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;