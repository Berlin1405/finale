
import React, { useState } from 'react';
import { Book, Code, Database, Server, Cpu, GraduationCap, ChevronRight, FileText, FastForward, Shield, Copy, CheckCircle } from 'lucide-react';

interface SectionProps {
  title: string;
  icon: any;
  children: React.ReactNode;
}

const Section = ({ title, icon: Icon, children }: SectionProps) => (
  <section className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm mb-8">
    <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
      <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
        <Icon size={24} />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
    </div>
    {children}
  </section>
);

const ProjectGuide = () => {
  const [copied, setCopied] = useState(false);

  const sampleJson = {
    "info": {
      "name": "APISEC Testing Collection",
      "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "item": [
      {
        "name": "Users",
        "item": [{
          "name": "Get User Profile",
          "request": {
            "method": "GET",
            "url": { "raw": "/api/v1/users/:userId/profile", "path": ["api", "v1", "users", ":userId", "profile"], "variable": [{ "key": "userId", "value": "1001" }] },
            "auth": { "type": "bearer" }
          }
        }]
      },
      {
        "name": "Admin",
        "item": [{
          "name": "Get Admin Stats",
          "request": { "method": "GET", "url": { "raw": "/api/v1/admin/stats", "path": ["api", "v1", "admin", "stats"] } }
        }]
      }
    ]
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(sampleJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="text-center mb-16">
        <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase">Final Year Project Documentation</span>
        <h1 className="text-4xl font-extrabold text-slate-900 mt-4 mb-4">APISEC Architecture</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">This section provides the complete theoretical and technical blueprint for your BE/BTech project submission.</p>
      </div>

      <Section title="Test Your Scanner" icon={Code}>
        <div className="space-y-4">
          <p className="text-slate-700 text-sm">
            To demonstrate the project in your viva, use the sample JSON below. Save it as <code>test.json</code> and upload it in the <strong>New Scan</strong> section.
          </p>
          <div className="relative group">
            <pre className="bg-slate-900 text-slate-300 p-6 rounded-xl text-[11px] overflow-auto max-h-60 border border-slate-800">
              {JSON.stringify(sampleJson, null, 2)}
            </pre>
            <button
              onClick={copyToClipboard}
              className="absolute top-4 right-4 bg-slate-800 hover:bg-indigo-600 text-white p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold"
            >
              {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy JSON'}
            </button>
          </div>
        </div>
      </Section>

      <Section title="Problem Statement" icon={Book}>
        <p className="text-slate-700 leading-relaxed">
          Modern applications rely heavily on APIs (Application Programming Interfaces). However, most traditional scanners focus on web pages, not the underlying data exchange.
          <strong> BOLA (Broken Object Level Authorization)</strong> remains the #1 vulnerability on the OWASP API Security Top 10 list. Developers often fail to check if a user is authorized to access a specific data object, allowing attackers to manipulate IDs and steal private data.
          APISEC provides an automated way to detect these logical flaws.
        </p>
      </Section>

      <Section title="Final Year Project Outline (Thesis Chapters)" icon={FileText}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-100 p-4 rounded-lg bg-slate-50/50">
              <h4 className="font-bold text-slate-900 text-sm mb-2 underline decoration-indigo-500 decoration-2">Chapter 1: Introduction</h4>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Overview of API Security</li>
                <li>• Motivation & Project Scope</li>
                <li>• Research Questions</li>
              </ul>
            </div>
            <div className="border border-slate-100 p-4 rounded-lg bg-slate-50/50">
              <h4 className="font-bold text-slate-900 text-sm mb-2 underline decoration-indigo-500 decoration-2">Chapter 2: Literature Survey</h4>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Analysis of Existing Tools (Zap, Burp)</li>
                <li>• OWASP Top 10 API 2023 Analysis</li>
                <li>• Gaps in Current Automated Solutions</li>
              </ul>
            </div>
            <div className="border border-slate-100 p-4 rounded-lg bg-slate-50/50">
              <h4 className="font-bold text-slate-900 text-sm mb-2 underline decoration-indigo-500 decoration-2">Chapter 3: System Design</h4>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• DFD Level 0, 1, and 2</li>
                <li>• UML Diagrams (Use Case, Sequence)</li>
                <li>• Component Architecture</li>
              </ul>
            </div>
            <div className="border border-slate-100 p-4 rounded-lg bg-slate-50/50">
              <h4 className="font-bold text-slate-900 text-sm mb-2 underline decoration-indigo-500 decoration-2">Chapter 4: Implementation</h4>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Scanner Engine Logic</li>
                <li>• JWT Tampering Module</li>
                <li>• Gemini AI Integration</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Core Algorithms" icon={Cpu}>
        <div className="space-y-6">
          <div>
            <h4 className="font-bold text-indigo-600 mb-2">1. Endpoint Discovery Algorithm</h4>
            <p className="text-sm text-slate-600 leading-relaxed">Recursively crawls a target URL or parses an OpenAPI JSON/YAML to map out all methods (GET, POST, etc.) and paths. It uses regular expressions to identify ID-based paths like <code>/api/user/[0-9]+</code>.</p>
          </div>
          <div>
            <h4 className="font-bold text-indigo-600 mb-2">2. BOLA Detection Logic (The Viva Highlight)</h4>
            <div className="bg-slate-900 text-emerald-400 p-4 rounded-lg mono text-xs leading-relaxed border border-slate-800">
              FOR each path containing variable '{"{id}"}':<br />
              &nbsp;&nbsp;captured_id = GET(endpoint, User_A_Token)<br />
              &nbsp;&nbsp;target_id = captured_id + random_offset<br />
              &nbsp;&nbsp;response = GET(endpoint/{"{target_id}"}, User_A_Token)<br />
              &nbsp;&nbsp;IF response.status == 200 AND response.body contains 'sensitive_data':<br />
              &nbsp;&nbsp;&nbsp;&nbsp;FLAG_VULNERABILITY(Type.BOLA, Severity.CRITICAL)
            </div>
          </div>
        </div>
      </Section>

      <Section title="Future Enhancements" icon={FastForward}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30">
            <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2"><Cpu size={16} /> AI Reinforcement Learning</h4>
            <p className="text-xs text-indigo-800 leading-relaxed">Implementing an agent that learns the sequence of API calls needed to reach sensitive states, bypassing simple auth checks.</p>
          </div>
          <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30">
            <h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-2"><Database size={16} /> CI/CD Integration</h4>
            <p className="text-xs text-emerald-800 leading-relaxed">Developing a GitHub Action that automatically runs APISEC scans on every pull request to ensure security by design.</p>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default ProjectGuide;
