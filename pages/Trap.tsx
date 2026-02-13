import React, { useState } from 'react';
import { db, isDemoMode } from '../services/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export const Trap: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        if (isDemoMode()) {
            console.log("Honeypot Trap Triggered (Demo):", { username, password });
            // Simulate log
            const logData = {
                timestamp: new Date().toISOString(),
                sourceIp: "127.0.0.1",
                honeypotId: "web-trap-local",
                severity: "HIGH",
                tactic: "Credential Access",
                technique: "Brute Force",
                payload: `Login attempt: ${username} / ${password}`,
                country: "Unknown"
            };
            // In demo mode we might not have write access if no keys, but we try
            // or just fake the delay
            await new Promise(r => setTimeout(r, 1500));
        } else {
            // Log to Firestore directly if no backend API is running in this env
            // In real prod this goes to /api/honeypot/login
            await addDoc(collection(db, "threat_logs"), {
                timestamp: serverTimestamp(),
                sourceIp: "Simulated External IP",
                honeypotId: "web-trap-001",
                severity: "HIGH",
                tactic: "Credential Access",
                technique: "Brute Force",
                payload: `Login attempt: ${username} / ${password}`,
                country: "Unknown"
            });
            await new Promise(r => setTimeout(r, 1500));
        }
        setError("Invalid credentials provided.");
    } catch (err) {
        setError("Connection error.");
    } finally {
        setLoading(false);
        setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans text-gray-900">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
            <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Admin Portal</h1>
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <input 
                        type="text" 
                        required
                        className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input 
                        type="password" 
                        required
                        className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Authenticating...' : 'Sign In'}
                </button>
            </form>
            <p className="mt-4 text-xs text-center text-gray-400">Authorized personnel only. All activity is monitored.</p>
        </div>
    </div>
  );
};