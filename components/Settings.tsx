
import React, { useState } from 'react';
import { Save, Trash2, ShieldCheck, Cpu, Bell, Database } from 'lucide-react';

const Settings = ({ onClearScans }: { onClearScans: () => void }) => {
  const [config, setConfig] = useState({
    aiAnalysis: true,
    deepFuzzing: false,
    autoDiscovery: true,
    notifications: true,
  });

  const handleToggle = (key: keyof typeof config) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-indigo-600" size={20} />
            Scanner Configuration
          </h2>
          <p className="text-sm text-slate-500">Fine-tune how the automated scanner interacts with target APIs.</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 h-fit">
                <Cpu size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Gemini AI Analysis</h4>
                <p className="text-xs text-slate-500">Generate intelligent remediation steps and risk summaries using LLMs.</p>
              </div>
            </div>
            <button 
              onClick={() => handleToggle('aiAnalysis')}
              className={`w-12 h-6 rounded-full transition-colors relative ${config.aiAnalysis ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${config.aiAnalysis ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-slate-50 pt-6">
            <div className="flex gap-4">
              <div className="bg-orange-50 p-2 rounded-lg text-orange-600 h-fit">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Aggressive BOLA Fuzzing</h4>
                <p className="text-xs text-slate-500">Iteratively test thousands of ID combinations. (May increase scan time significantly)</p>
              </div>
            </div>
            <button 
              onClick={() => handleToggle('deepFuzzing')}
              className={`w-12 h-6 rounded-full transition-colors relative ${config.deepFuzzing ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${config.deepFuzzing ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Database className="text-red-600" size={20} />
            Data Management
          </h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-slate-900">Clear Scan History</h4>
              <p className="text-xs text-slate-500">Permanently delete all previous scan results and findings from local storage.</p>
            </div>
            <button 
              onClick={() => {
                if(confirm('Are you sure you want to delete all scans?')) onClearScans();
              }}
              className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors border border-red-100"
            >
              <Trash2 size={16} />
              <span className="text-sm font-bold">Clear All Data</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
          <Save size={18} />
          Save Preferences
        </button>
      </div>
    </div>
  );
};

export default Settings;
