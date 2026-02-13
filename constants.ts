import { Honeypot, HoneypotStatus, HoneypotType, ThreatLog, ThreatSeverity, DeceptionProfile, Tenant, AddOn, SubscriptionTier } from './types';

// --- MOCK DATA FOR DOMAIN ENTITIES ---

export const MOCK_DECEPTION_PROFILES: DeceptionProfile[] = [
  {
    id: 'dp-001',
    name: 'Ubuntu 20.04 LTS Web Server',
    osFamily: 'Linux',
    osVersion: 'Ubuntu 20.04.6 LTS',
    kernelVersion: '5.4.0-144-generic',
    bannerTemplate: 'SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.5',
    fakeServices: ['nginx', 'postgresql-client'],
    honeytokens: true,
    internalNetwork: true
  },
  {
    id: 'dp-002',
    name: 'Legacy CentOS Database Node',
    osFamily: 'Linux',
    osVersion: 'CentOS Linux 7 (Core)',
    kernelVersion: '3.10.0-1160.el7.x86_64',
    bannerTemplate: 'SSH-2.0-OpenSSH_7.4',
    fakeServices: ['mysqld', 'redis'],
    honeytokens: true,
    internalNetwork: false
  },
  {
    id: 'dp-003',
    name: 'Windows Server 2019 (IIS)',
    osFamily: 'Windows',
    osVersion: 'Windows Server 2019 Datacenter',
    kernelVersion: '10.0.17763',
    bannerTemplate: 'Microsoft HTTPAPI/2.0',
    fakeServices: ['IIS', 'MSSQL'],
    honeytokens: false,
    internalNetwork: true
  }
];

export const MOCK_HONEYPOTS: Honeypot[] = [
  {
    id: 'hp-001',
    name: 'Production-DB-Replica',
    type: HoneypotType.DATABASE,
    region: 'us-east-1',
    port: 5432,
    status: HoneypotStatus.ACTIVE,
    uptime: '14d 2h',
    attacks24h: 128,
    profileId: 'dp-001'
  },
  {
    id: 'hp-002',
    name: 'Legacy-Auth-Service',
    type: HoneypotType.SSH,
    region: 'eu-west-2',
    port: 2222,
    status: HoneypotStatus.COMPROMISED,
    uptime: '2d 5h',
    attacks24h: 3450,
    profileId: 'dp-002'
  },
  {
    id: 'hp-003',
    name: 'Internal-Admin-Portal',
    type: HoneypotType.HTTP,
    region: 'ap-northeast-1',
    port: 8080,
    status: HoneypotStatus.ACTIVE,
    uptime: '45d 12h',
    attacks24h: 45,
    profileId: 'dp-003'
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
    tactic: 'Discovery',
    technique: 'System Information Discovery',
    payload: 'uname -a && whoami',
    sessionLog: [
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 5 - 5000).toISOString(),
        command: 'uname -a',
        response: 'Linux legacy-auth 3.10.0-1160.el7.x86_64 #1 SMP Mon Oct 19 16:18:59 UTC 2020 x86_64 x86_64 x86_64 GNU/Linux',
        tags: ['Recon']
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 5 - 4000).toISOString(),
        command: 'whoami',
        response: 'root',
        tags: ['Privilege Check']
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 5 - 3000).toISOString(),
        command: 'cat /etc/passwd',
        response: 'root:x:0:0:root:/root:/bin/bash\nbin:x:1:1:bin:/bin:/sbin/nologin...',
        tags: ['File Access']
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 5 - 1000).toISOString(),
        command: 'ping -c 2 10.0.0.5',
        response: 'PING 10.0.0.5 (10.0.0.5) 56(84) bytes of data.\n64 bytes from 10.0.0.5: icmp_seq=1 ttl=64 time=0.045 ms',
        tags: ['Lateral Movement', 'Network Discovery']
      }
    ]
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

export const HEATMAP_DATA = MITRE_TACTICS.map(tactic => ({
  tactic,
  count: Math.floor(Math.random() * 50)
}));


// --- BILLING CONSTANTS ---

export const SUBSCRIPTION_PLANS = {
  SCOUT: {
    id: 'SCOUT',
    name: 'Scout',
    price: 0,
    features: ['1 Honeypot Node', 'SSH Only', '5k Logs/Mo', '3-Day Retention', 'Community Support'],
    limits: {
      maxHoneypots: 1,
      maxLogsPerMonth: 5000,
      retentionDays: 3,
      customPorts: false,
      adaptiveDeception: false,
      internalSimulation: false,
      campaignDetection: false,
      supportLevel: 'Community'
    }
  },
  HUNTER: {
    id: 'HUNTER',
    name: 'Hunter',
    price: 49,
    features: ['5 Honeypot Nodes', 'SSH + HTTP', '50k Logs/Mo', '30-Day Retention', 'Adaptive Deception', 'Email Support'],
    limits: {
      maxHoneypots: 5,
      maxLogsPerMonth: 50000,
      retentionDays: 30,
      customPorts: false,
      adaptiveDeception: true,
      internalSimulation: false,
      campaignDetection: false,
      supportLevel: 'Email'
    }
  },
  SENTINEL: {
    id: 'SENTINEL',
    name: 'Sentinel',
    price: 199,
    features: ['15 Honeypot Nodes', 'All Protocols', '250k Logs/Mo', '90-Day Retention', 'Internal Network Sim', 'Priority Support'],
    limits: {
      maxHoneypots: 15,
      maxLogsPerMonth: 250000,
      retentionDays: 90,
      customPorts: true,
      adaptiveDeception: true,
      internalSimulation: true,
      campaignDetection: true,
      supportLevel: 'Priority'
    }
  },
  PREDATOR: {
    id: 'PREDATOR',
    name: 'Predator',
    price: 999,
    features: ['Unlimited Nodes', 'Dedicated AI', '1M+ Logs/Mo', '180-Day Retention', 'SSO & Compliance', 'SLA Support'],
    limits: {
      maxHoneypots: 9999,
      maxLogsPerMonth: 1000000,
      retentionDays: 180,
      customPorts: true,
      adaptiveDeception: true,
      internalSimulation: true,
      campaignDetection: true,
      supportLevel: 'SLA'
    }
  }
};

export const AVAILABLE_ADDONS: AddOn[] = [
  { id: 'addon_node_pack', name: 'Wolf Pack', description: 'Add 5 extra honeypot nodes to your fleet.', price: 29, metric: '+5 Nodes' },
  { id: 'addon_log_boost', name: 'Data Stream', description: 'Increase ingestion cap by 100k logs.', price: 49, metric: '+100k Logs' },
  { id: 'addon_retention', name: 'Deep Freeze', description: 'Extend log retention by 365 days.', price: 99, metric: '+1 Year' },
  { id: 'addon_intel', name: 'Global Feed', description: 'Access Wolfarium Global Threat Intelligence Feed.', price: 149, metric: 'Feed Access' }
];

export const MOCK_TENANT: Tenant = {
  id: 'tenant_123',
  name: 'Acme Corp Security',
  tier: 'SENTINEL',
  status: 'TRIAL',
  trialEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(), // 12 days left
  isStudent: false,
  isBeta: true,
  limits: SUBSCRIPTION_PLANS.SENTINEL.limits as any,
  usage: {
    honeypotsUsed: 3,
    logsIngestedMonth: 12450,
    storageUsedGB: 4.2,
    lastUpdated: new Date().toISOString()
  },
  addOns: ['addon_intel']
};