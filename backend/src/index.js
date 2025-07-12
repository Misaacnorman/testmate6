const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const materialRoutes = require('./routes/material.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const resultsRoutes = require('./routes/results.routes');
const reportsRoutes = require('./routes/reports.routes');
const settingsRoutes = require('./routes/settings.routes');
const userRoutes = require('./routes/user.routes');
const usersRoutes = require('./routes/users.routes');
const roleRoutes = require('./routes/role.routes');
const sampleLogsRoutes = require('./routes/sampleLogs.routes');
const receiptRoutes = require('./routes/receipt.routes');
const financeRoutes = require('./routes/finance.routes');
const clientRoutes = require('./routes/client.routes');
const projectRoutes = require('./routes/project.routes');
const sampleRoutes = require('./routes/sample.routes');

// Import JWT strategy
require('./auth/jwt.strategy');

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Initialize Passport
app.use(passport.initialize());

// Test route
app.get('/', (req, res) => {
  console.log('Root endpoint called');
  res.json({ message: 'Material Tests API is running!' });
});

// Add a test endpoint for debugging
app.get('/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ message: 'Test endpoint working!' });
});

// Register API routes
app.use('/api/material-tests', materialRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users', usersRoutes);
app.use('/api', roleRoutes);
app.use('/api/sample-logs', sampleLogsRoutes);
app.use('/api', receiptRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/samples', sampleRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
