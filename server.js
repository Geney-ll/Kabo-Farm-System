/**
 * Kabo Farm Management System - Application Entry Point
 *
 * Starts an Express server, mounts API routes, serves the static frontend
 * (vanilla HTML/CSS/JS), and initialises the SQLite database on first run.
 */

const path = require('path');
const express = require('express');
const session = require('express-session');

const { initDatabase } = require('./src/db/database');
const { seedIfEmpty } = require('./src/db/seed');

const authRoutes = require('./src/routes/authRoutes');
const cropRoutes = require('./src/routes/cropRoutes');
const livestockRoutes = require('./src/routes/livestockRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const activityRoutes = require('./src/routes/activityRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const userRoutes = require('./src/routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Initialise database (creates tables on first run) ----
initDatabase();
seedIfEmpty();

// ---- Middleware ----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'kabo-farm-dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 8, // 8 hours
    },
  })
);

// ---- API routes ----
app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/livestock', livestockRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

// ---- Static frontend ----
app.use(express.static(path.join(__dirname, 'public')));

// ---- Default route -> login page ----
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---- Generic error handler ----
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Kabo Farm System running at http://localhost:${PORT}`);
});
