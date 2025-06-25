import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { MainPage } from "../pages/MainPage"
import { VisualizerPage } from "../pages/VisualizerPage"
import { NotionTestPage } from "../pages/NotionTestPage"
import { Navigation } from "../components/Navigation"
import './App.css'
import { ConnectionPage } from '../pages/ConnectionPage'

function App() {
  return (
    <Router>
      <Navigation />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/visualizer" element={<VisualizerPage />} />
          <Route path="/test" element={<NotionTestPage />} />
          <Route path="/connect" element={<ConnectionPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
