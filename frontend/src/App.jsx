import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:8000'

export default function App() {
  const [apiStatus, setApiStatus] = useState('checking')

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then(r => r.json())
      .then(data => setApiStatus(data.status === 'ok' ? 'connected' : 'error'))
      .catch(() => setApiStatus('disconnected'))
  }, [])

  const statusColor = {
    checking:     '#888',
    connected:    '#4ade80',
    disconnected: '#f87171',
    error:        '#fb923c',
  }[apiStatus]

  return (
    <div className="app">
      <h1>GradeFlow <span className="accent">AI</span></h1>
      <p className="tagline">AI-powered handwritten assignment grader</p>

      <div className="status-card">
        <span className="dot" style={{ background: statusColor }} />
        <span>
          API&nbsp;
          <strong style={{ color: statusColor }}>
            {apiStatus === 'checking' ? 'checking…' : apiStatus}
          </strong>
          &nbsp;— {API_URL}
        </span>
      </div>
    </div>
  )
}
