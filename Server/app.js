const express = require("express");
const path = require('path'); // Import path
const cors = require("cors");
const dotenv = require('dotenv').config(); // Loads the variables

// Add this line to check if it worked
const app = express();
const PORT = 3000;

// DB
const db = require('./conn/db');

db();

// Routes
const authRoutes = require('./routes/authRoutes');
const voterRoutes = require('./routes/voterRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');
const bulkShareRoutes = require('./routes/bulkShareRoutes');

// Middleware
app.use(cors());
app.use(express.json());
console.log("📂 Serving uploads from:", path.join(process.cwd(), 'uploads')); // Debug log
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', voterRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bulk', bulkShareRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
