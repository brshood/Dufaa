'use strict';

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { createObjectCsvWriter } = require('csv-writer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Static files
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const csvPath = path.join(dataDir, 'subscribers.csv');
const csvWriter = createObjectCsvWriter({
  path: csvPath,
  header: [
    { id: 'timestamp', title: 'timestamp' },
    { id: 'name', title: 'name' },
    { id: 'email', title: 'email' }
  ],
  append: fs.existsSync(csvPath)
});

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  // Simplified RFC 5322 email regex
  const re = /^(?:[A-Z0-9_'^&+%`{}~!#$*\/=?|.-]+)@(?:[A-Z0-9-]+\.)+[A-Z]{2,}$/i;
  return re.test(email.trim());
}

app.post('/api/subscribe', async (req, res) => {
  const { name, email } = req.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ ok: false, error: 'Name is required' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: 'Valid email is required' });
  }

  try {
    const row = {
      timestamp: new Date().toISOString(),
      name: name.trim(),
      email: email.trim().toLowerCase()
    };

    // Ensure headers exist if file missing
    const fileExists = fs.existsSync(csvPath);
    if (!fileExists) {
      await csvWriter.writeRecords([]); // initializes file with header
    }
    await csvWriter.writeRecords([row]);
    return res.json({ ok: true });
  } catch (err) {
    console.error('CSV write failed:', err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Fallback to index.html for root
app.get('*', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


