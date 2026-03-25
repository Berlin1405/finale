
import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, ArrowRight, ShieldCheck, Globe, Database, Server, AlertTriangle } from 'lucide-react';
import { ScanResult, Severity } from '../types';
import SecurityPostureRoadmap from './SecurityPostureRoadmap';

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      </div>
      <div className={`${color} p-2 rounded-lg`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </div>
);

const Dashboard = ({ scans }: { scans: ScanResult[] }) => {
  const latestScan = scans.length > 0 ? scans[0] : null;
  
  // Group scans by Target URL to identify unique Applications
  const uniqueApps = Array.from(new Set(scans.map(s => s.targetUrl)));
  const totalApps = uniqueApps.length;
  
  // Get latest health score per app
  const appHealthMap = scans.reduce((acc, scan) => {
    if (!acc[scan.targetUrl]) {
      acc[scan.targetUrl] = scan.overallScore;
    }
    return acc;
  }, {} as Record<string, number>);

  const healthyApps = Object.values(appHealthMap).filter(score => score >= 80).length;
  const atRiskApps = Object.values(appHealthMap).filter(score => score < 80).length;

  const chartData = [
    { name: 'Healthy', count: healthyApps, color: '#10b981' },
    { name: 'At Risk', count: atRiskApps, color: '#f59e0b' },
    { name: 'Critical', count: Object.values(appHealthMap).filter(s => s < 40).length, color: '#ef4444' },
  ];

  const vulnerabilitySteps = latestScan ? Array.from(new Set(latestScan.findings.map(f => f.stepId))) : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Applications" value={totalApps} icon={Globe} color="bg-indigo-600" />
        <StatCard title="Healthy APIs" value={healthyApps} icon={ShieldCheck} color="bg-emerald-600" />
        <StatCard title="Apps At Risk" value={atRiskApps} icon={AlertTriangle} color="bg-amber-500" />
        <StatCard title="Endpoints Audited" value={scans.reduce((acc, s) => acc + s.endpointsScanned, 0)} icon={Database} color="bg-blue-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Server size={20} className="text-indigo-600" />
              Application Health Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center justify-between">
              Application Inventory
              <Link to="/scan" className="text-xs text-indigo-600 font-bold hover:underline">Add New App</Link>
            </h3>
            <div className="space-y-4">
              {uniqueApps.length === 0 ? (
                <div className="text-center py-10">
                  <Globe size={40} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-slate-400 text-sm">No applications registered for scanning yet.</p>
                </div>
              ) : (
                uniqueApps.map(appUrl => {
                  const lastScan = scans.find(s => s.targetUrl === appUrl);
                  if (!lastScan) return null;
                  return (
                    <Link to={`/report/${lastScan.id}`} key={appUrl} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors group">
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900 truncate">{appUrl}</h4>
                          {lastScan.status === 'STOPPED_BY_VULNERABILITY' && (
                            <span className="bg-red-100 text-red-600 text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-red-200">Incomplete/Vulnerable</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Last Scan: {new Date(lastScan.timestamp).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                           <span className={`text-sm font-bold block ${lastScan.overallScore >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                             {lastScan.overallScore}% Secure
                           </span>
                           <span className="text-[10px] text-slate-400 font-bold uppercase">{lastScan.endpointsScanned} Endpoints</span>
                        </div>
                        <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <SecurityPostureRoadmap 
            currentStep={latestScan ? latestScan.completedSteps : 0} 
            vulnerabilitySteps={vulnerabilitySteps}
            score={latestScan?.overallScore}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
