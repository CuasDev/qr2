import { useState, useRef, useEffect } from 'react';
import '../styles/QRGenerator.css';
import QRCodeWithLogo from 'qrcode-with-logos';

const QRGenerator = () => {
  const [formData, setFormData] = useState({
    text: '',
    color: '#000000',
    backgroundColor: '#FFFFFF',
    size: 300,
    margin: 4
  });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const qrRef = useRef(null);

  // Generar código QR con logo localmente
  const generateQR = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.text) {
        throw new Error('Por favor ingrese un texto o URL');
      }

      // Crear un elemento canvas para el QR
      const qrCodeWithLogo = new QRCodeWithLogo({
        content: formData.text,
        width: formData.size,
        download: false,
        logo: logoPreview ? logoPreview : undefined,
        logoWidth: logoPreview ? formData.size / 4 : undefined,
        logoHeight: logoPreview ? formData.size / 4 : undefined,
        logoOpacity: 1,
        qrOptions: {
          errorCorrectionLevel: 'H',
          margin: formData.margin,
          color: {
            dark: formData.color,
            light: formData.backgroundColor
          }
        }
      });

      const canvas = await qrCodeWithLogo.getCanvas();
      const qrDataUrl = canvas.toDataURL('image/png');

      // Guardar en el backend
      const formDataToSend = new FormData();
      formDataToSend.append('text', formData.text);
      formDataToSend.append('color', formData.color);
      formDataToSend.append('backgroundColor', formData.backgroundColor);
      formDataToSend.append('size', formData.size);
      formDataToSend.append('margin', formData.margin);
      formDataToSend.append('imageUrl', qrDataUrl);
      
      if (logo) {
        formDataToSend.append('logo', logo);
      }

      const response = await fetch('http://localhost:5000/api/qr', {
        method: 'POST',
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
      <h2>Generador de Códigos QR con Logo</h2>
      
      <div className="qr-container">
        <form onSubmit={generateQR} className="qr-form">
          <div className="form-group">
            <label htmlFor="text">Texto o URL</label>
            <input
              type="text"
              id="text"
              name="text"
              value={formData.text}
              onChange={handleChange}
              placeholder="Ingrese texto o URL"
              required
            />
          </div>

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