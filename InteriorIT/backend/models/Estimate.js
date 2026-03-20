const mongoose = require('mongoose');

const estimateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  date: { type: Date, default: Date.now },
  totalAmount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Estimate', estimateSchema);
