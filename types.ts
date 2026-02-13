export enum ThreatSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum HoneypotStatus {
  ACTIVE = 'ACTIVE',
  DEPLOYING = 'DEPLOYING',
  OFFLINE = 'OFFLINE',
  COMPROMISED = 'COMPROMISED'
}

export enum HoneypotType {
  SSH = 'SSH',
  HTTP = 'HTTP',
  DATABASE = 'PostgreSQL',
  RDP = 'RDP'
}

export interface Honeypot {
  id: string;
  name: string;
  type: HoneypotType;
  region: string;
  status: HoneypotStatus;
  uptime: string;
  attacks24h: number;
}

export interface ThreatLog {
  id: string;
  timestamp: string;
  sourceIp: string;
  country: string;
  honeypotId: string;
  severity: ThreatSeverity;
  tactic: string; // MITRE Tactic
  technique: string; // MITRE Technique
  payload: string; // The raw command or payload attempted
}

export interface Tenant {
  id: string;
  name: string;
  plan: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
}

export interface AiAnalysisResult {
  summary: string;
  vector: string;
  remediation: string;
  confidence: number;
}