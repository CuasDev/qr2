import QrCode from '../models/QrCode.js';
import QRCode from 'qrcode';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configuración de rutas para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Asegurar que existe el directorio de uploads
const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdir(uploadDir, { recursive: true }).catch(err => console.error('Error al crear directorio uploads:', err));

// Generar código QR
export const generateQR = async (req, res) => {
  try {
    const { text, color, backgroundColor, size, margin, imageUrl } = req.body;
    let logoPath = null;
    
    // Verificar si se subió un logo
    if (req.file) {
      logoPath = `/uploads/${req.file.filename}`;
    }
    
    // Usar la imagen generada en el frontend o generarla en el backend
    let qrDataUrl = imageUrl;
    
    // Si no hay imagen del frontend, generarla en el backend
    if (!qrDataUrl) {
      // Opciones para generar el QR
      const options = {
        color: {
          dark: color || '#000000',
          light: backgroundColor || '#FFFFFF'
        },
        width: parseInt(size) || 300,
        margin: parseInt(margin) || 4,
        errorCorrectionLevel: 'H' // Alto nivel para permitir logo
      };
      
      // Generar QR como data URL
      qrDataUrl = await QRCode.toDataURL(text, options);
    }
    
    // Guardar en la base de datos
    const qrCode = new QrCode({
      text,
      logo: logoPath,
      color: color || '#000000',
      backgroundColor: backgroundColor || '#FFFFFF',
      size: parseInt(size) || 300,
      margin: parseInt(margin) || 4,
      imageUrl: qrDataUrl
    });
    
    await qrCode.save();
    
    res.status(201).json({
      success: true,
      data: qrCode
    });
  } catch (error) {
    console.error('Error al generar código QR:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el código QR',
      error: error.message
    });
  }
};

// Obtener todos los códigos QR
export const getAllQRs = async (req, res) => {
  try {
    const qrCodes = await QrCode.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: qrCodes.length,
      data: qrCodes
    });
  } catch (error) {
    console.error('Error al obtener códigos QR:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los códigos QR',
      error: error.message
    });
  }
};

// Obtener un código QR por ID
export const getQRById = async (req, res) => {
  try {
    const qrCode = await QrCode.findById(req.params.id);
    
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'Código QR no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: qrCode
    });
  } catch (error) {
    console.error('Error al obtener código QR:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el código QR',
      error: error.message
    });
  }
};

// Eliminar un código QR
export const deleteQR = async (req, res) => {
  try {
    const qrCode = await QrCode.findById(req.params.id);
    
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'Código QR no encontrado'
      });
    }
    
    await qrCode.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Código QR eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar código QR:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el código QR',
      error: error.message
    });
  }
};