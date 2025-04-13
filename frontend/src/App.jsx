import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import QRGenerator from './components/QRGenerator'
import QRHistory from './components/QRHistory'

function App() {
  const [activeTab, setActiveTab] = useState('generator')

  return (
    <div className="app">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        {activeTab === 'generator' ? (
          <QRGenerator />
        ) : (
          <QRHistory />
        )}
      </main>

      <footer className="footer">
        <p>Generador de Códigos QR con Logo &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}

export default App
