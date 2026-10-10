import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Quests } from './pages/Quests';
import { LearnHub } from './pages/LearnHub';
import { Mentor } from './pages/Mentor';
import { Flashcards } from './pages/Flashcards';
import { Achievements } from './pages/Achievements';
import { Settings } from './pages/Settings';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0A0F2D] to-black">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/learnhub" element={<LearnHub />} />
          <Route path="/mentor" element={<Mentor />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/settings" element={<Settings />} />
          {/* Redirect any unknown routes to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;