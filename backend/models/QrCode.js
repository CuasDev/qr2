import mongoose from 'mongoose';

const QrCodeSchema = new mongoose.Schema({  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'El texto o URL para el código QR es obligatorio'],
    trim: true
  },
  logo: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: '#000000'
  },
  backgroundColor: {
    type: String,
    default: '#FFFFFF'
  },
  size: {
    type: Number,
    default: 300,
    min: [100, 'El tamaño mínimo es 100px'],
    max: [1000, 'El tamaño máximo es 1000px']
  },
  margin: {
    type: Number,
    default: 4,
    min: [0, 'El margen mínimo es 0'],
    max: [10, 'El margen máximo es 10']
  },
  imageUrl: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const QrCode = mongoose.model('QrCode', QrCodeSchema);

export default QrCode;