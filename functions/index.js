/**
 * HAAS Backend - Cloud Functions
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

// --- ORCHESTRATOR / MANAGEMENT API ---

// Deploy a new honeypot container
app.post("/deploy", async (req, res) => {
  try {
    const { type, region, name } = req.body;
    
    // Validate inputs
    if (!type || !region) return res.status(400).json({ error: "Missing type or region" });

    // Simulate orchestration (e.g., Kubernetes API call or Docker spin-up)
    const containerId = `hp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Store metadata in Firestore
    await db.collection("honeypots").doc(containerId).set({
      id: containerId,
      name: name || `${type}-Node-${region}`,
      type,
      region,
      status: "DEPLOYING",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      attacks24h: 0,
      uptime: "0s"
    });

    res.status(200).json({ success: true, id: containerId, message: "Deploying honeypot..." });
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

    res.status(200).json({ success: true, message: "Honeypot stopped" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
      country: "Unknown", // In real prod, use GeoIP lookup here
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

    // Always return failure to the attacker to keep them trying
    // Add artificial delay to slow down brute force
    setTimeout(() => {
        res.status(401).json({ error: "Invalid credentials" });
    }, 1500);

  } catch (err) {
    console.error("Honeypot logging error", err);
    res.status(500).send("Internal Server Error"); // Generic error
  }
});

// Expose Express App as a Cloud Function
exports.api = functions.https.onRequest(app);
