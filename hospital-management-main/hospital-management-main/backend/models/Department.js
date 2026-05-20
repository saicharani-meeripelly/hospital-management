const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, unique: true, uppercase: true },
  description: { type: String },
  head: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  location: { type: String },
  phone: { type: String },
  totalBeds: { type: Number, default: 0 },
  availableBeds: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  services: [String]
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
