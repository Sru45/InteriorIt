const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  address: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
