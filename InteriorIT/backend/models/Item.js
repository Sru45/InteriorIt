const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  estimateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Estimate', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemName: { type: String, required: true },
  length: { type: Number, required: true },
  width: { type: Number, required: true },
  qty: { type: Number, required: true },
  rate: { type: Number, required: true },
  sqft: { type: Number, required: true },
  amount: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
