const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Admission = require('../models/Admission');
const Billing = require('../models/Billing');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalPatients,
      totalDoctors,
      todayAppointments,
      activeAdmissions,
      pendingBills,
      monthlyRevenue,
      recentPatients,
      appointmentsByStatus,
      monthlyPatients
    ] = await Promise.all([
      Patient.countDocuments({ status: 'Active' }),
      Doctor.countDocuments({ isAvailable: true }),
      Appointment.countDocuments({ appointmentDate: { $gte: today, $lt: tomorrow } }),
      Admission.countDocuments({ status: { $in: ['Admitted', 'Under Treatment'] } }),
      Billing.aggregate([
        { $match: { paymentStatus: { $in: ['Pending', 'Partial'] } } },
        { $group: { _id: null, total: { $sum: '$balance' } } }
      ]),
      Billing.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(new Date().setDate(1)) },
            paymentStatus: 'Paid'
          }
        },
        { $group: { _id: null, total: { $sum: '$paidAmount' } } }
      ]),
      Patient.find().sort({ createdAt: -1 }).limit(5).select('firstName lastName patientId createdAt status'),
      Appointment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Patient.aggregate([
        {
          $group: {
            _id: { $month: '$createdAt' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } },
        { $limit: 12 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        todayAppointments,
        activeAdmissions,
        pendingBills: pendingBills[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        recentPatients,
        appointmentsByStatus,
        monthlyPatients
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/revenue', async (req, res) => {
  try {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      last6Months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
    }

    const revenue = await Billing.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$totalAmount' },
          paid: { $sum: '$paidAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.json({ success: true, data: revenue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
