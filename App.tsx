
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, Search, FileText, Settings as SettingsIcon, BookOpen, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ScanForm from './components/ScanForm';
import VulnerabilityReport from './components/VulnerabilityReport';
import ProjectGuide from './components/ProjectGuide';
import Settings from './components/Settings';
import { ScanResult } from './types';

const SidebarLink = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const AppContent = () => {
  const location = useLocation();
  const [scans, setScans] = useState<ScanResult[]>(() => {
    const saved = localStorage.getItem('api_safe_scans');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('api_safe_scans', JSON.stringify(scans));
  }, [scans]);

  const addScan = (newScan: ScanResult) => {
    setScans(prev => [newScan, ...prev]);
  };

  const clearScans = () => {
    setScans([]);
    localStorage.removeItem('api_safe_scans');
  };

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col fixed h-full z-10">
        <div className="flex items-center space-x-3 mb-10">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Shield className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">APISEC</span>
        </div>

        <nav className="space-y-2 flex-1">
          <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
          <SidebarLink to="/scan" icon={Search} label="New Scan" active={location.pathname === '/scan'} />
          <SidebarLink to="/guide" icon={BookOpen} label="Project Guide" active={location.pathname === '/guide'} />
        </nav>

        <div className="pt-6 border-t border-slate-800">
          <SidebarLink to="/settings" icon={SettingsIcon} label="Settings" active={location.pathname === '/settings'} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8 bg-slate-50 min-h-screen">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {location.pathname === '/' ? 'Security Overview' : 
               location.pathname === '/scan' ? 'Vulnerability Scanner' :
               location.pathname === '/guide' ? 'FYP Documentation' : 
               location.pathname === '/settings' ? 'System Settings' : 'Report'}
            </h1>
            <p className="text-slate-500">Automated API Security Testing & BOLA Analysis</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <CheckCircle2 size={14} /> System Secure
            </span>
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard scans={scans} />} />
            <Route path="/scan" element={<ScanForm onScanComplete={addScan} />} />
            <Route path="/report/:id" element={<VulnerabilityReport scans={scans} />} />
            <Route path="/guide" element={<ProjectGuide />} />
            <Route path="/settings" element={<Settings onClearScans={clearScans} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
