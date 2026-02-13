import { Honeypot, HoneypotStatus, HoneypotType, ThreatLog, ThreatSeverity } from './types';

export const MOCK_HONEYPOTS: Honeypot[] = [
  {
    id: 'hp-001',
    name: 'Production-DB-Replica',
    type: HoneypotType.DATABASE,
    region: 'us-east-1',
    status: HoneypotStatus.ACTIVE,
    uptime: '14d 2h',
    attacks24h: 128
  },
  {
    id: 'hp-002',
    name: 'Legacy-Auth-Service',
    type: HoneypotType.SSH,
    region: 'eu-west-2',
    status: HoneypotStatus.COMPROMISED,
    uptime: '2d 5h',
    attacks24h: 3450
  },
  {
    id: 'hp-003',
    name: 'Internal-Admin-Portal',
    type: HoneypotType.HTTP,
    region: 'ap-northeast-1',
    status: HoneypotStatus.ACTIVE,
    uptime: '45d 12h',
    attacks24h: 45
  }
];

export const MOCK_THREATS: ThreatLog[] = [
  {
    id: 'log-x92',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    sourceIp: '192.168.1.105',
    country: 'CN',
    honeypotId: 'hp-002',
    severity: ThreatSeverity.CRITICAL,
    tactic: 'Credential Access',
    technique: 'Brute Force',
    payload: 'ssh root@10.0.0.5 -p 22'
  },
  {
    id: 'log-x93',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    sourceIp: '45.22.19.11',
    country: 'RU',
    honeypotId: 'hp-001',
    severity: ThreatSeverity.HIGH,
    tactic: 'Execution',
    technique: 'Command Injection',
    payload: "'; DROP TABLE users; --"
  },
  {
    id: 'log-x94',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    sourceIp: '89.102.44.12',
    country: 'IR',
    honeypotId: 'hp-003',
    severity: ThreatSeverity.MEDIUM,
    tactic: 'Discovery',
    technique: 'Network Service Scanning',
    payload: 'GET /admin/config.xml HTTP/1.1'
  },
  {
    id: 'log-x95',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    sourceIp: '102.33.21.5',
    country: 'US',
    honeypotId: 'hp-002',
    severity: ThreatSeverity.LOW,
    tactic: 'Reconnaissance',
    technique: 'Active Scanning',
    payload: 'nmap -sS -p 1-65535 10.0.0.5'
  }
];

export const MITRE_TACTICS = [
  'Reconnaissance',
  'Resource Development',
  'Initial Access',
  'Execution',
  'Persistence',
  'Privilege Escalation',
  'Defense Evasion',
  'Credential Access',
  'Discovery',
  'Lateral Movement',
  'Collection',
  'Command and Control',
  'Exfiltration',
  'Impact'
];

// For the heatmap visual
export const HEATMAP_DATA = MITRE_TACTICS.map(tactic => ({
  tactic,
  count: Math.floor(Math.random() * 50)
}));