const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  admissionId: { type: String, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  admissionDate: { type: Date, required: true, default: Date.now },
  dischargeDate: { type: Date },
  roomNumber: { type: String },
  bedNumber: { type: String },
  roomType: {
    type: String,
    enum: ['General', 'Semi-Private', 'Private', 'ICU', 'CCU', 'Emergency'],
    default: 'General'
  },
  admissionReason: { type: String, required: true },
  diagnosis: { type: String },
  status: {
    type: String,
    enum: ['Admitted', 'Under Treatment', 'Discharged', 'Transferred'],
    default: 'Admitted'
  },
  dischargeNotes: { type: String },
  dailyRate: { type: Number, default: 0 },
  totalDays: { type: Number, default: 0 },
  admittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

admissionSchema.pre('save', async function (next) {
  if (!this.admissionId) {
    const count = await mongoose.model('Admission').countDocuments();
    this.admissionId = `ADM${String(count + 1).padStart(6, '0')}`;
  }
  if (this.dischargeDate && this.admissionDate) {
    const diff = this.dischargeDate - this.admissionDate;
    this.totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  next();
});

module.exports = mongoose.model('Admission', admissionSchema);
