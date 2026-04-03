const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');

// Inject environment variables natively for Netlify runtime edge
process.env.JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_interiorit_2026';
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://srushtisuthar2811_db_user:v951aONB9dRLR3zl@cluster0.fqtfctk.mongodb.net/interior_it?retryWrites=true&w=majority&appName=Cluster0';

const authRoutes = require('../../api-server/routes/auth');
const estimateRoutes = require('../../api-server/routes/estimates');

const app = express();
app.use(cors());
app.use(express.json());

// Bind routes prefix specifically for Netlify Functions mapping
app.use('/.netlify/functions/api/auth', authRoutes);
app.use('/.netlify/functions/api/estimate', estimateRoutes);

// Serverless warm-up DB connection optimizer
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log('MongoDB Connected correctly to Serverless Edge');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

// Attach warm-up layer to all incoming requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

module.exports.handler = serverless(app);
