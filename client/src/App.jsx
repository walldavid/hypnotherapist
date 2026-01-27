import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <header>
          <h1>Hypnotherapist.ie</h1>
          <p>Professional Hypnotherapy Products & Courses</p>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

function Home() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Welcome</h2>
      <p>Your journey to transformation begins here.</p>
      <p style={{ marginTop: '2rem', color: '#666' }}>
        🚧 Under Construction 🚧
      </p>
    </div>
  )
}

export default App
