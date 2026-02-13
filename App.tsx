import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Honeypots } from './pages/Honeypots';
import { Threats } from './pages/Threats';
import { Settings } from './pages/Settings';
import { Trap } from './pages/Trap';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Honeypot Trap Route - No Layout, clean UI to trick attackers */}
        <Route path="/trap" element={<Trap />} />
        
        {/* Main Application Routes */}
        <Route path="*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/honeypots" element={<Honeypots />} />
              <Route path="/threats" element={<Threats />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
};

export default App;