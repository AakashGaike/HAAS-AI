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
  RDP = 'RDP',
  REDIS = 'REDIS',
  ELASTIC = 'ELASTIC'
}

export interface DeceptionProfile {
  id: string;
  name: string;
  osFamily: 'Linux' | 'Windows';
  osVersion: string;
  kernelVersion: string;
  bannerTemplate: string;
  fakeServices: string[]; // e.g. ['mysql', 'apache2']
  honeytokens: boolean; // Inject fake AWS keys/DB creds
  internalNetwork: boolean; // Simulate 10.0.0.x hosts
}

export interface CommandLog {
  timestamp: string;
  command: string;
  response: string; // The fake response sent to attacker
  tags: string[]; // e.g. ['Recon', 'Lateral Movement']
}

export interface Honeypot {
  id: string;
  name: string;
  type: HoneypotType;
  region: string;
  port: number;
  status: HoneypotStatus;
  uptime: string;
  attacks24h: number;
  profileId?: string; // Linked Deception Profile
}

export interface ThreatLog {
  id: string;
  timestamp: string;
  sourceIp: string;
  country: string;
  honeypotId: string;
  severity: ThreatSeverity;
  tactic: string;
  technique: string;
  payload: string;
  sessionLog?: CommandLog[]; // For adaptive shell replay
}

export interface AiAnalysisResult {
  summary: string;
  vector: string;
  remediation: string;
  confidence: number;
}

// --- BILLING & SUBSCRIPTION TYPES ---

export type SubscriptionTier = 'SCOUT' | 'HUNTER' | 'SENTINEL' | 'PREDATOR';

export interface PlanLimits {
  maxHoneypots: number;
  maxLogsPerMonth: number;
  retentionDays: number;
  customPorts: boolean;
  adaptiveDeception: boolean;
  internalSimulation: boolean;
  campaignDetection: boolean;
  supportLevel: 'Community' | 'Email' | 'Priority' | 'SLA';
}

export interface UsageMetrics {
  honeypotsUsed: number;
  logsIngestedMonth: number;
  storageUsedGB: number;
  lastUpdated: string;
}

export interface Tenant {
  id: string;
  name: string;
  tier: SubscriptionTier;
  status: 'ACTIVE' | 'TRIAL' | 'PAST_DUE' | 'CANCELLED';
  trialEndsAt?: string;
  isStudent?: boolean;
  isBeta?: boolean;
  limits: PlanLimits;
  usage: UsageMetrics;
  addOns: string[]; // IDs of active add-ons
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  metric: string; // e.g. "+5 Nodes"
}