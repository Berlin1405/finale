
import React, { useMemo } from 'react';
import { CheckCircle2, Circle, AlertCircle, ChevronRight, ShieldAlert, XCircle, Ban } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { VulnerabilityType } from '../types';

interface RoadmapProps {
  currentStep?: number;
  isScanning?: boolean;
  vulnerabilitySteps?: number[]; // IDs of steps where issues were found
  score?: number;
}

const SecurityPostureRoadmap = ({ currentStep = 0, isScanning = false, vulnerabilitySteps = [], score }: RoadmapProps) => {
  const steps = [
    { id: 1, label: 'Explore your API Composition' },
    { id: 2, label: 'Application is Reachable' },
    { id: 3, label: 'Start Unauthenticated Scan' },
    { id: 4, label: 'Configure API Authentication' },
    { id: 5, label: 'Start Authenticated Scan' },
    { id: 6, label: 'Configure Parameter Values' },
    { id: 7, label: 'Configure RBAC' },
    { id: 8, label: 'Configure for BOLA' },
    { id: 9, label: 'Configure for Mass Assignment' },
  ];

  const percentage = useMemo(() => {
    if (isScanning) {
      return Math.round((currentStep / steps.length) * 100);
    }
    // If not scanning and currentStep < 9, it means it was stopped
    if (currentStep < 9 && score !== undefined) {
       return score;
    }
    return score !== undefined ? score : 0;
  }, [currentStep, isScanning, score, steps.length]);
  
  const data = [
    { value: percentage, color: percentage < 40 ? '#ef4444' : percentage < 80 ? '#f97316' : '#3b82f6' },
    { value: 100 - percentage, color: '#f1f5f9' },
  ];

  const getStatus = (stepId: number) => {
    const hasVulnerability = vulnerabilitySteps.includes(stepId);
    
    if (stepId <= currentStep) {
      return hasVulnerability ? 'failed' : 'completed';
    }
    
    // If currentStep < 9 and we are not scanning, further steps are "Blocked"
    if (!isScanning && currentStep < 9 && stepId > currentStep) return 'blocked';
    
    if (isScanning && stepId === currentStep + 1) return 'recommended';
    
    return 'pending';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-full flex flex-col sticky top-8">
      <div className="flex items-center justify-between mb-4">
         <h3 className="text-slate-500 font-bold text-xs uppercase tracking-widest">App Model</h3>
         {vulnerabilitySteps.length > 0 && (
           <div className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border border-red-100">
              <ShieldAlert size={12} /> SCAN HALTED
           </div>
         )}
      </div>
      
      <div className="h-36 w-full relative mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={65}
              outerRadius={95}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              animationDuration={1200}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center">
          <span className={`text-4xl font-black tracking-tighter ${percentage < 50 ? 'text-red-600' : 'text-slate-900'}`}>
            {percentage}%
          </span>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
            {isScanning ? 'Scanning...' : 'Health Score'}
          </p>
        </div>
      </div>

      <div className="relative space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[500px]">
        <div className="absolute left-[13px] top-4 bottom-4 w-0.5 bg-slate-100 z-0" />

        {steps.map((step) => {
          const status = getStatus(step.id);
          const isCompleted = status === 'completed';
          const isFailed = status === 'failed';
          const isRecommended = status === 'recommended';
          const isBlocked = status === 'blocked';

          return (
            <div key={step.id} className="relative z-10 flex items-start gap-4">
              <div className="mt-1">
                {isCompleted ? (
                  <div className="bg-white rounded-full">
                     <CheckCircle2 size={28} className="text-emerald-500 fill-white" />
                  </div>
                ) : isFailed ? (
                  <div className="bg-white rounded-full shadow-sm">
                     <XCircle size={28} className="text-red-500 fill-white" />
                  </div>
                ) : isBlocked ? (
                  <div className="bg-white rounded-full p-1 opacity-50">
                     <Ban size={20} className="text-slate-300" />
                  </div>
                ) : isRecommended ? (
                  <div className="bg-white rounded-full border-2 border-indigo-500 p-0.5 animate-pulse shadow-lg shadow-indigo-100">
                     <Circle size={22} className="text-indigo-600 fill-indigo-50" />
                  </div>
                ) : (
                  <div className="bg-white rounded-full border border-slate-200 p-0.5">
                     <Circle size={22} className="text-slate-200" />
                  </div>
                )}
              </div>

              <div className={`flex-1 rounded-xl border transition-all duration-300 ${
                isFailed 
                  ? 'bg-red-50 border-red-100 shadow-sm' 
                  : isRecommended 
                  ? 'bg-amber-50 border-amber-200 shadow-md translate-x-1' 
                  : isCompleted
                  ? 'bg-white border-slate-200'
                  : isBlocked
                  ? 'bg-slate-50 border-slate-100 opacity-40 italic'
                  : 'bg-white border-slate-100 opacity-40'
              } p-3`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold tracking-tight ${
                    isFailed ? 'text-red-700' : isCompleted ? 'text-slate-900' : isRecommended ? 'text-indigo-900' : isBlocked ? 'text-slate-400' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </span>
                  {isFailed && <AlertCircle size={14} className="text-red-500" />}
                </div>
                {isFailed && !isScanning && (
                  <p className="text-[9px] text-red-600 font-bold mt-1 uppercase">Process Stopped Here</p>
                )}
                {isBlocked && (
                  <p className="text-[8px] text-slate-400 font-medium mt-0.5">Test Aborted</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SecurityPostureRoadmap;
