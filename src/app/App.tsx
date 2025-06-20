import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { MainPage } from "../components/MainPage"
import { VisualizerPage } from "../pages/VisualizerPage"
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/visualizer" element={<VisualizerPage />} />
      </Routes>
    </Router>
  )
}

export default App
