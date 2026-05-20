const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  billId: { type: String, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  admission: { type: mongoose.Schema.Types.ObjectId, ref: 'Admission' },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  billDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  items: [{
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['Consultation', 'Room Charges', 'Medicine', 'Lab Test', 'Surgery', 'Nursing', 'Other']
    },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    total: { type: Number }
  }],
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid', 'Overdue', 'Cancelled'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Insurance', 'Online', 'Cheque']
  },
  insurance: {
    provider: String,
    claimNumber: String,
    coveredAmount: Number
  },
  notes: { type: String },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

billingSchema.pre('save', async function (next) {
  if (!this.billId) {
    const count = await mongoose.model('Billing').countDocuments();
    this.billId = `BILL${String(count + 1).padStart(6, '0')}`;
  }
  // Calculate totals
  this.subtotal = this.items.reduce((sum, item) => {
    item.total = item.quantity * item.unitPrice;
    return sum + item.total;
  }, 0);
  this.totalAmount = this.subtotal - this.discount + this.tax;
  this.balance = this.totalAmount - this.paidAmount;
  if (this.balance <= 0) this.paymentStatus = 'Paid';
  else if (this.paidAmount > 0) this.paymentStatus = 'Partial';
  next();
});

module.exports = mongoose.model('Billing', billingSchema);
