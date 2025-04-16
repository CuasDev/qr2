# QR Generator Pro

![QR Generator Pro](https://img.shields.io/badge/QR%20Generator-Pro-4a6cf7)

## 📋 Descripción

QR Generator Pro es una aplicación web completa para la generación de códigos QR personalizados con logo. Esta aplicación permite a los usuarios crear, personalizar, guardar y gestionar códigos QR para diferentes tipos de contenido, ofreciendo una experiencia de usuario intuitiva y moderna.

## ✨ Características

- **Múltiples tipos de contenido QR**:
  - Texto/URL
  - vCard (tarjeta de contacto)
  - WiFi
  - Email
  - SMS
  - Geolocalización
  - Eventos

- **Personalización avanzada**:
  - Añadir logo personalizado
  - Cambiar colores del código QR
  - Ajustar tamaño y márgenes

- **Gestión de códigos QR**:
  - Guardar códigos generados
  - Historial de códigos creados
  - Vista detallada de cada código
  - Descargar en formato imagen

- **Sistema de autenticación**:
  - Registro de usuarios
  - Inicio de sesión
  - Protección de rutas

## 🛠️ Tecnologías

### Frontend
- **React** - Biblioteca para construir interfaces de usuario
- **React Router** - Navegación entre componentes
- **React QR Code** - Generación de códigos QR
- **CSS3** - Estilos personalizados y responsivos
- **Vite** - Herramienta de construcción y desarrollo

### Backend
- **Node.js** - Entorno de ejecución para JavaScript
- **Express** - Framework para aplicaciones web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación basada en tokens

## 🏗️ Arquitectura

El proyecto sigue una arquitectura cliente-servidor:

### Estructura del Frontend
```
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── AuthModal.jsx
│   │   ├── Header.jsx
│   │   ├── Login.jsx
│   │   ├── QRDetail.jsx
│   │   ├── QRGenerator.jsx
│   │   ├── QRHistory.jsx
│   │   └── Register.jsx
│   ├── styles/
│   │   ├── Auth.css
│   │   ├── Header.css
│   │   ├── QRDetail.css
│   │   ├── QRGenerator.css
│   │   └── QRHistory.css
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
└── package.json
```

### Estructura del Backend
```
backend/
├── controllers/
│   ├── authController.js
│   └── qrController.js
├── middleware/
│   └── authMiddleware.js
├── models/
│   ├── QrCode.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   └── qrRoutes.js
├── uploads/
├── .env
├── server.js
└── package.json
```

## 🚀 Instalación y Uso

### Requisitos previos
- Node.js (v14 o superior)
- MongoDB

### Configuración del Backend

1. Clonar el repositorio
   ```bash
   git clone https://github.com/tu-usuario/qr-generator-pro.git
   cd qr-generator-pro
   ```

2. Instalar dependencias del backend
   ```bash
   cd backend
   npm install
   ```

3. Crear archivo .env con las siguientes variables
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/qr-generator
   JWT_SECRET=tu_clave_secreta
   ```

4. Iniciar el servidor
   ```bash
   npm start
   ```

### Configuración del Frontend

1. Instalar dependencias del frontend
   ```bash
   cd ../frontend
   npm install
   ```

2. Iniciar el servidor de desarrollo
   ```bash
   npm run dev
   ```

3. Abrir en el navegador: `http://localhost:5173`

## 📱 Capturas de Pantalla

*(Aquí puedes incluir capturas de pantalla de tu aplicación)*

## 🔒 Seguridad

- Autenticación mediante JWT (JSON Web Tokens)
- Contraseñas encriptadas con bcrypt
- Validación de datos en frontend y backend
- Protección de rutas privadas

## 🌐 Despliegue

La aplicación puede ser desplegada en plataformas como:
- Frontend: Vercel, Netlify, GitHub Pages
- Backend: Heroku, Railway, Render
- Base de datos: MongoDB Atlas

## 👨‍💻 Desarrollador

Desarrollado por [Tu Nombre](https://github.com/tu-usuario) como parte de mi portfolio de desarrollo web.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.