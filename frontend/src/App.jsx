import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import QRGenerator from './components/QRGenerator'
import QRHistory from './components/QRHistory'
import QRDetail from './components/QRDetail'

function App() {
  const [activeTab, setActiveTab] = useState('generator')

  return (
    <Router>
      <div className="app">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={activeTab === 'generator' ? <QRGenerator /> : <QRHistory />} />
            <Route path="/history" element={<QRHistory />} />
            <Route path="/qr/:id" element={<QRDetail />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>Generador de Códigos QR con Logo &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </Router>
  )
}

export default App
