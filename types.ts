
export enum Severity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO'
}

export enum VulnerabilityType {
  BOLA = 'BOLA (Broken Object Level Authorization)',
  BPTA = 'Broken Property Level Authorization',
  JWT_EXPOSURE = 'JWT Secret Exposure',
  MISSING_AUTH = 'Missing Authentication',
  MASS_ASSIGNMENT = 'Mass Assignment',
  RATE_LIMITING = 'Lack of Resources & Rate Limiting',
  INJECTION = 'Injection (SQL/NoSQL)',
  DOS = 'Denial of Service (Application Crash)'
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description?: string;
  parameters?: string[];
  requiresAuth: boolean;
}

export interface Finding {
  id: string;
  type: VulnerabilityType;
  severity: Severity;
  endpoint: string;
  description: string;
  remediation: string;
  evidence: string;
  stepId: number; // Links finding to App Model step
}

export interface ScanResult {
  id: string;
  timestamp: string;
  targetUrl: string;
  status: 'COMPLETED' | 'FAILED' | 'IN_PROGRESS' | 'STOPPED_BY_VULNERABILITY';
  findings: Finding[];
  endpointsScanned: number;
  overallScore: number;
  authUsed: boolean;
  completedSteps: number; // 1 to 9
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
}
