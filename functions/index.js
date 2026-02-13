/**
 * WOLFARIUM Backend - Cloud Functions
 * Deployed to Firebase
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// --- CONSTANTS FOR ENFORCEMENT ---
const PLAN_LIMITS = {
    SCOUT: { maxHoneypots: 1, maxLogs: 5000, customPorts: false },
    HUNTER: { maxHoneypots: 5, maxLogs: 50000, customPorts: false },
    SENTINEL: { maxHoneypots: 15, maxLogs: 250000, customPorts: true },
    PREDATOR: { maxHoneypots: 9999, maxLogs: 1000000, customPorts: true }
};

// --- MIDDLEWARE: ENFORCE SUBSCRIPTION QUOTAS ---
const enforceQuota = async (req, res, next) => {
    // In a real app, tenantId comes from decoded Auth Token
    // For prototype, we simulate a 'SENTINEL' tenant unless specified
    const tenantId = req.headers['x-tenant-id'] || 'tenant_123'; 
    const resourceType = req.path.includes('deploy') ? 'honeypot' : 'logs';

    try {
        // Fetch Tenant Data (cached in real prod)
        // Mocking the DB fetch for this snippet
        const tenantTier = 'SENTINEL'; // Assuming Sentinel for demo
        const currentUsage = { honeypots: 3, logs: 12450 }; // Mock usage

        const limits = PLAN_LIMITS[tenantTier];

        if (resourceType === 'honeypot') {
            if (currentUsage.honeypots >= limits.maxHoneypots) {
                return res.status(402).json({ 
                    error: "Quota Exceeded", 
                    message: `Upgrade plan to deploy more nodes. Limit: ${limits.maxHoneypots}` 
                });
            }
            // Check Custom Ports for lower tiers
            if (req.body.port && req.body.port !== 2222 && !limits.customPorts) {
                return res.status(403).json({
                    error: "Feature Restricted",
                    message: "Custom ports require Sentinel plan or higher."
                });
            }
        }

        next();
    } catch (err) {
        console.error("Enforcement Error:", err);
        res.status(500).json({ error: "Internal Authorization Error" });
    }
};

// --- ORCHESTRATOR / MANAGEMENT API ---

// Deploy a new honeypot container with Custom Port and Deception Profile
// Added enforceQuota middleware
app.post("/deploy", enforceQuota, async (req, res) => {
  try {
    const { type, region, name, port, profileId } = req.body;
    
    // Validate inputs
    if (!type || !region) return res.status(400).json({ error: "Missing type or region" });

    // Validate Port (Wolfarium Pro Feature)
    const targetPort = port || 2222;
    if (targetPort < 1 || targetPort > 65535) {
        return res.status(400).json({ error: "Invalid port range" });
    }

    // Simulate orchestration (e.g., Kubernetes API call or Docker spin-up)
    const containerId = `wolf-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Store metadata in Firestore
    await db.collection("honeypots").doc(containerId).set({
      id: containerId,
      name: name || `${type}-Node-${region}`,
      type,
      region,
      port: targetPort,
      profileId: profileId || 'default',
      status: "DEPLOYING",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      attacks24h: 0,
      uptime: "0s"
    });

    // Increment Usage Counter (Atomic Increment)
    // await db.collection("tenants").doc("tenant_123").update({
    //    "usage.honeypotsUsed": admin.firestore.FieldValue.increment(1)
    // });

    res.status(200).json({ success: true, id: containerId, message: "Deploying Wolfarium node..." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Deployment failed" });
  }
});

// Stop/Destroy a honeypot
app.post("/stop", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "Missing ID" });

    await db.collection("honeypots").doc(id).update({
      status: "OFFLINE",
      stoppedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Decrement Usage Counter
    // await db.collection("tenants").doc("tenant_123").update({
    //    "usage.honeypotsUsed": admin.firestore.FieldValue.increment(-1)
    // });

    res.status(200).json({ success: true, message: "Node decomissioned" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- BILLING ENDPOINTS ---

app.post("/billing/portal", async (req, res) => {
    // In production, this creates a Stripe Billing Portal session
    res.json({ url: "https://billing.stripe.com/p/session/test_123" });
});

app.post("/billing/upgrade", async (req, res) => {
    const { planId } = req.body;
    // In production, this updates the Stripe Subscription
    // For prototype, we acknowledge receipt
    res.json({ success: true, message: `Upgraded to ${planId}`, nextBillDate: "2023-11-01" });
});

// --- HONEYPOT TRAP ENDPOINTS ---

// Fake Login Endpoint - Captures Credentials
app.post("/honeypot/login", async (req, res) => {
  const attackerIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];
  const { username, password } = req.body;

  try {
    const logData = {
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      sourceIp: attackerIP || "unknown",
      country: "Unknown", 
      honeypotId: "web-trap-001",
      severity: "HIGH",
      tactic: "Credential Access",
      technique: "Brute Force",
      payload: `Login attempt: ${username} / ${password}`,
      metadata: { userAgent }
    };

    // Log the threat
    await db.collection("threat_logs").add(logData);

    // Trigger Alert if password provided
    if (password && password.length > 0) {
      await db.collection("alerts").add({
        type: "honeypot_triggered",
        severity: "HIGH",
        message: `Credential theft attempt from ${attackerIP}`,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Wolfarium Logic: Return vague error to keep attacker guessing
    setTimeout(() => {
        res.status(401).json({ error: "Authentication failed." });
    }, 1200);

  } catch (err) {
    console.error("Honeypot logging error", err);
    res.status(500).send("Internal Error"); 
  }
});

// Expose Express App as a Cloud Function
exports.api = functions.https.onRequest(app);