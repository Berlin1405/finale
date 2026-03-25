import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  ShieldAlert,
  Loader2,
  Key,
  Upload,
  FileJson,
  Search,
  X,
  AlertOctagon
} from 'lucide-react';

import { ScannerEngine } from '../services/scannerEngine';
import {
  ScanResult,
  ApiEndpoint,
  Finding,
  Severity,
  VulnerabilityType
} from '../types';

import SecurityPostureRoadmap from './SecurityPostureRoadmap';

const ScanForm = ({
  onScanComplete
}: {
  onScanComplete: (scan: ScanResult) => void;
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [scanMode, setScanMode] = useState<'AUTO' | 'UPLOAD'>('AUTO');
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedEndpoints, setParsedEndpoints] = useState<ApiEndpoint[]>([]);

  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [roadmapStep, setRoadmapStep] = useState(0);
  const [liveFindings, setLiveFindings] = useState<Finding[]>([]);
  const [stoppedMessage, setStoppedMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const endpoints = ScannerEngine.parseCollection(content);
        setParsedEndpoints(endpoints);
      };
      reader.readAsText(file);
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (scanMode === 'AUTO' && !url) return;
    if (scanMode === 'UPLOAD' && parsedEndpoints.length === 0) return;

    setIsScanning(true);
    setLiveFindings([]);
    setStoppedMessage(null);

    try {
      let endpoints: ApiEndpoint[] = [];
      let finalStatus: 'COMPLETED' | 'STOPPED_BY_VULNERABILITY' =
        'COMPLETED';
      let lastCompletedStep = 0;
      const allFindings: Finding[] = [];

      // ------------------------
      // STAGE 1 - DISCOVERY
      // ------------------------
      setRoadmapStep(1);
      setScanStep('Exploring API Composition...');
      await new Promise((r) => setTimeout(r, 1000));

      endpoints =
        scanMode === 'AUTO'
          ? await ScannerEngine.discoverEndpoints(url)
          : parsedEndpoints;

      lastCompletedStep = 1;

      // ------------------------
      // STAGE 2 - REACHABILITY
      // ------------------------
      setRoadmapStep(2);
      setScanStep('Verifying Reachability...');
      await new Promise((r) => setTimeout(r, 1200));

      // 🔴 1️⃣ SMG FAILURE
      const smgEndpoint = endpoints.find((e) =>
        e.path.toLowerCase().includes('smg')
      );

      if (smgEndpoint) {
        const smgFinding: Finding = {
          id: Math.random().toString(36).substring(2, 9),
          type: VulnerabilityType.DOS,
          severity: Severity.CRITICAL,
          endpoint: smgEndpoint.path,
          description:
            'Application failed reachability verification due to unstable endpoint.',
          evidence: 'Connection refused (Simulation Failure)',
          remediation:
            'Ensure service availability and verify routing and infrastructure configuration.',
          stepId: 2
        };

        allFindings.push(smgFinding);
        setLiveFindings([...allFindings]);

        finalStatus = 'STOPPED_BY_VULNERABILITY';
        lastCompletedStep = 2;

        setScanStep('CRITICAL STOP: Application Not Reachable');
        setStoppedMessage(
          'Scan halted during reachability check (Endpoint detected).'
        );
      }

      // 🔴 2️⃣ SIMULATE CRASH FAILURE
      else {
        const crashEndpoint = endpoints.find((e) =>
          e.path.includes('simulate-crash')
        );

        if (crashEndpoint) {
          setScanStep('Testing System Stability...');
          await new Promise((r) => setTimeout(r, 1500));

          const crashFinding: Finding = {
            id: Math.random().toString(36).substring(2, 9),
            type: VulnerabilityType.DOS,
            severity: Severity.CRITICAL,
            endpoint: crashEndpoint.path,
            description:
              'Application became unreachable immediately after discovery.',
            evidence: '503 Service Unavailable (Simulated)',
            remediation:
              'Implement circuit breakers and resilience patterns.',
            stepId: 2
          };

          allFindings.push(crashFinding);
          setLiveFindings([...allFindings]);

          finalStatus = 'STOPPED_BY_VULNERABILITY';
          lastCompletedStep = 2;

          setScanStep('CRITICAL STOP: Service Unreachable');
          setStoppedMessage(
            'Scan halted. Application became unreachable.'
          );
        }

        // 🟢 CONTINUE NORMAL SCAN
        else {
          lastCompletedStep = 2;

          const steps = [
            { id: 3, label: 'Running Unauthenticated Scan...' },
            { id: 4, label: 'Configuring Authentication...' },
            { id: 5, label: 'Running Authenticated Scan...' },
            { id: 6, label: 'Testing Parameter Fuzzing...' },
            { id: 7, label: 'Analyzing RBAC...' },
            { id: 8, label: 'Probing BOLA...' },
            { id: 9, label: 'Checking Mass Assignment...' }
          ];

          const fullScanResults =
            await ScannerEngine.runFullScan(
              url || 'Collection',
              endpoints
            );

          for (const step of steps) {
            setRoadmapStep(step.id);
            setScanStep(step.label);

            const findingsForStep = fullScanResults.filter(
              (f) => f.stepId === step.id
            );

            if (findingsForStep.length > 0) {
              allFindings.push(...findingsForStep);
              setLiveFindings([...allFindings]);

              finalStatus = 'STOPPED_BY_VULNERABILITY';
              lastCompletedStep = step.id;

              setScanStep(
                `CRITICAL STOP: Vulnerability found in step ${step.id}`
              );
              setStoppedMessage(
                `Scanning halted. High-risk security flaw detected during "${step.label}".`
              );

              await new Promise((r) => setTimeout(r, 1500));
              break;
            }

            lastCompletedStep = step.id;
            await new Promise((r) => setTimeout(r, 1000));
          }
        }
      }

      // ------------------------
      // FINAL RESULT
      // ------------------------
      const newScan: ScanResult = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        targetUrl:
          url || uploadedFile?.name || 'Manual Collection',
        status: finalStatus,
        endpointsScanned: endpoints.length,
        findings: allFindings,
        overallScore: Math.max(0, 100 - allFindings.length * 20),
        authUsed: !!token,
        completedSteps: lastCompletedStep
      };

      onScanComplete(newScan);

      if (finalStatus === 'STOPPED_BY_VULNERABILITY') {
        await new Promise((r) => setTimeout(r, 2000));
      }

      navigate(`/report/${newScan.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className={`${stoppedMessage ? 'bg-red-600' : 'bg-indigo-600'} p-8 text-white transition-colors duration-500`}>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              {stoppedMessage ? <AlertOctagon className="animate-pulse" /> : null}
              {stoppedMessage ? 'Scan Terminated' : 'Initialize Security Scan'}
            </h2>
            <p className="text-indigo-100 opacity-90 text-sm">
              {stoppedMessage || 'Target a specific API URL or upload an existing collection of endpoints to begin analysis.'}
            </p>
          </div>

          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setScanMode('AUTO')}
              disabled={isScanning}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${scanMode === 'AUTO' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Search size={18} /> Automated Discovery
            </button>
            <button
              onClick={() => setScanMode('UPLOAD')}
              disabled={isScanning}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${scanMode === 'UPLOAD' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Upload size={18} /> Upload Collection
            </button>
          </div>

          <form onSubmit={handleScan} className="p-8 space-y-6">
            {scanMode === 'AUTO' ? (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Globe size={16} className="text-indigo-600" /> Target API Base URL
                </label>
                <input
                  type="text"
                  placeholder="https://api.example.com/v1"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none transition-all disabled:bg-slate-50"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required={scanMode === 'AUTO'}
                  disabled={isScanning}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <FileJson size={16} className="text-indigo-600" /> Endpoint Collection (.json)
                </label>
                {!uploadedFile ? (
                  <div
                    onClick={() => !isScanning && fileInputRef.current?.click()}
                    className={`border-2 border-dashed border-slate-200 rounded-xl p-8 text-center transition-all ${!isScanning ? 'hover:border-indigo-400 cursor-pointer' : ''}`}
                  >
                    <Upload className="mx-auto text-slate-300 mb-2" size={32} />
                    <p className="text-sm font-medium text-slate-600">Click to upload Postman/Swagger file</p>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} disabled={isScanning} />
                  </div>
                ) : (
                  <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{uploadedFile.name}</span>
                    <button type="button" onClick={() => { setUploadedFile(null); setParsedEndpoints([]); }} className="text-slate-400 hover:text-red-500" disabled={isScanning}><X size={18} /></button>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Key size={16} className="text-indigo-600" /> Auth Token (User A)
              </label>
              <textarea
                placeholder="Bearer eyJhbG..."
                className="w-full px-4 py-3 rounded-lg border border-slate-200 h-20 resize-none text-sm disabled:bg-slate-50"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={isScanning}
              />
            </div>

            <button
              type="submit"
              disabled={isScanning || (scanMode === 'UPLOAD' && parsedEndpoints.length === 0)}
              className={`w-full font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-3 shadow-lg ${stoppedMessage ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}
            >
              {isScanning ? (
                <><Loader2 className="animate-spin" size={20} /><span>{scanStep}</span></>
              ) : (
                <><ShieldAlert size={20} /><span>Launch Security Audit</span></>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-1">
        <SecurityPostureRoadmap
          currentStep={roadmapStep}
          isScanning={isScanning}
          vulnerabilitySteps={Array.from(new Set(liveFindings.map(f => f.stepId)))}
        />
      </div>
    </div>
  );
};

export default ScanForm;
