const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  estimateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Estimate', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isSection: { type: Boolean, default: false },
  sectionName: { type: String, default: '' },
  itemName: { type: String, default: '' },
  length: { type: Number, default: 0 },
  width: { type: Number, default: 0 },
  qty: { type: Number, default: 1 },
  rate: { type: Number, default: 0 },
  sqft: { type: Number, default: 0 },
  amount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
