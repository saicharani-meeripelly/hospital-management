const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');
const Department = require('./models/Department');
const Appointment = require('./models/Appointment');
const Billing = require('./models/Billing');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_management');
  console.log('MongoDB connected for seeding');
};

const seed = async () => {
  await connectDB();

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Doctor.deleteMany({}),
    Patient.deleteMany({}),
    Department.deleteMany({}),
    Appointment.deleteMany({}),
    Billing.deleteMany({})
  ]);
  console.log('✅ Cleared existing data');

  // Create admin user
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@hospital.com',
    password: 'Admin@123',
    role: 'admin',
    phone: '9876543210'
  });

  await User.create([
    { name: 'Dr. Receptionist', email: 'reception@hospital.com', password: 'Reception@123', role: 'receptionist', phone: '9876543211' },
    { name: 'Head Nurse', email: 'nurse@hospital.com', password: 'Nurse@123', role: 'nurse', phone: '9876543212' }
  ]);

  console.log('✅ Users created');

  // Create departments
  const departments = await Department.create([
    { name: 'Cardiology', code: 'CARD', description: 'Heart and cardiovascular system', location: 'Block A, Floor 2', totalBeds: 30, availableBeds: 12, services: ['ECG', 'Echocardiogram', 'Angioplasty'] },
    { name: 'Neurology', code: 'NEUR', description: 'Brain and nervous system', location: 'Block B, Floor 3', totalBeds: 25, availableBeds: 8, services: ['MRI', 'EEG', 'CT Scan'] },
    { name: 'Orthopedics', code: 'ORTH', description: 'Bones, joints and muscles', location: 'Block C, Floor 1', totalBeds: 35, availableBeds: 15, services: ['X-Ray', 'Physiotherapy', 'Joint Replacement'] },
    { name: 'Pediatrics', code: 'PEDI', description: 'Children healthcare', location: 'Block D, Floor 1', totalBeds: 20, availableBeds: 10, services: ['Vaccination', 'Growth Monitoring', 'Child Nutrition'] },
    { name: 'Gynecology', code: 'GYNE', description: "Women's health", location: 'Block E, Floor 2', totalBeds: 28, availableBeds: 9, services: ['Prenatal Care', 'Ultrasound', 'Delivery'] },
    { name: 'General Medicine', code: 'GENM', description: 'General health and medicine', location: 'Block A, Floor 1', totalBeds: 50, availableBeds: 20, services: ['Blood Tests', 'General Checkup', 'Immunization'] },
    { name: 'Emergency', code: 'EMER', description: '24/7 emergency services', location: 'Ground Floor', totalBeds: 15, availableBeds: 5, services: ['Trauma Care', 'Resuscitation', 'Emergency Surgery'] }
  ]);
  console.log('✅ Departments created');

  // Create doctors
  const doctors = await Doctor.create([
    { firstName: 'Rajesh', lastName: 'Kumar', specialization: 'Cardiologist', department: departments[0]._id, qualification: ['MBBS', 'MD Cardiology', 'DM'], experience: 15, phone: '9811111111', email: 'rajesh.kumar@hospital.com', consultationFee: 800, isAvailable: true, rating: 4.8, schedule: [{ day: 'Monday', startTime: '09:00', endTime: '17:00' }, { day: 'Wednesday', startTime: '09:00', endTime: '17:00' }, { day: 'Friday', startTime: '09:00', endTime: '13:00' }] },
    { firstName: 'Priya', lastName: 'Sharma', specialization: 'Neurologist', department: departments[1]._id, qualification: ['MBBS', 'MD Neurology', 'DM'], experience: 12, phone: '9811111112', email: 'priya.sharma@hospital.com', consultationFee: 900, isAvailable: true, rating: 4.7, schedule: [{ day: 'Tuesday', startTime: '10:00', endTime: '18:00' }, { day: 'Thursday', startTime: '10:00', endTime: '18:00' }] },
    { firstName: 'Suresh', lastName: 'Reddy', specialization: 'Orthopedic Surgeon', department: departments[2]._id, qualification: ['MBBS', 'MS Orthopedics'], experience: 18, phone: '9811111113', email: 'suresh.reddy@hospital.com', consultationFee: 700, isAvailable: true, rating: 4.9 },
    { firstName: 'Anita', lastName: 'Patel', specialization: 'Pediatrician', department: departments[3]._id, qualification: ['MBBS', 'MD Pediatrics'], experience: 10, phone: '9811111114', email: 'anita.patel@hospital.com', consultationFee: 500, isAvailable: true, rating: 4.6 },
    { firstName: 'Meera', lastName: 'Nair', specialization: 'Gynecologist', department: departments[4]._id, qualification: ['MBBS', 'MS Gynecology', 'DNB'], experience: 14, phone: '9811111115', email: 'meera.nair@hospital.com', consultationFee: 750, isAvailable: true, rating: 4.8 },
    { firstName: 'Vikram', lastName: 'Singh', specialization: 'General Physician', department: departments[5]._id, qualification: ['MBBS', 'MD General Medicine'], experience: 8, phone: '9811111116', email: 'vikram.singh@hospital.com', consultationFee: 400, isAvailable: true, rating: 4.5 },
    { firstName: 'Deepak', lastName: 'Mehta', specialization: 'Emergency Medicine', department: departments[6]._id, qualification: ['MBBS', 'MD Emergency'], experience: 11, phone: '9811111117', email: 'deepak.mehta@hospital.com', consultationFee: 600, isAvailable: true, rating: 4.7 }
  ]);

  // Update department heads
  await Department.findByIdAndUpdate(departments[0]._id, { head: doctors[0]._id });
  await Department.findByIdAndUpdate(departments[1]._id, { head: doctors[1]._id });
  await Department.findByIdAndUpdate(departments[2]._id, { head: doctors[2]._id });
  console.log('✅ Doctors created');

  // Create patients
  const patients = await Patient.create([
    { firstName: 'Arun', lastName: 'Verma', dateOfBirth: new Date('1985-03-15'), gender: 'Male', bloodGroup: 'B+', phone: '9900001111', email: 'arun.verma@email.com', address: { street: '12 MG Road', city: 'Hyderabad', state: 'Telangana', zipCode: '500001' }, assignedDoctor: doctors[0]._id, status: 'Active', allergies: ['Penicillin'], registeredBy: admin._id },
    { firstName: 'Sunita', lastName: 'Joshi', dateOfBirth: new Date('1992-07-22'), gender: 'Female', bloodGroup: 'O+', phone: '9900002222', email: 'sunita.joshi@email.com', address: { street: '45 Jubilee Hills', city: 'Hyderabad', state: 'Telangana', zipCode: '500033' }, assignedDoctor: doctors[4]._id, status: 'Active', registeredBy: admin._id },
    { firstName: 'Mohan', lastName: 'Das', dateOfBirth: new Date('1978-11-08'), gender: 'Male', bloodGroup: 'A+', phone: '9900003333', email: 'mohan.das@email.com', address: { street: '78 Banjara Hills', city: 'Hyderabad', state: 'Telangana', zipCode: '500034' }, assignedDoctor: doctors[1]._id, status: 'Active', medicalHistory: [{ condition: 'Hypertension', diagnosedDate: new Date('2015-01-01'), notes: 'Controlled with medication' }], registeredBy: admin._id },
    { firstName: 'Kavitha', lastName: 'Rao', dateOfBirth: new Date('2000-05-12'), gender: 'Female', bloodGroup: 'AB+', phone: '9900004444', email: 'kavitha.rao@email.com', address: { street: '23 Gachibowli', city: 'Hyderabad', state: 'Telangana', zipCode: '500032' }, assignedDoctor: doctors[5]._id, status: 'Active', registeredBy: admin._id },
    { firstName: 'Ravi', lastName: 'Teja', dateOfBirth: new Date('1965-09-30'), gender: 'Male', bloodGroup: 'O-', phone: '9900005555', address: { city: 'Secunderabad', state: 'Telangana' }, assignedDoctor: doctors[2]._id, status: 'Active', medicalHistory: [{ condition: 'Diabetes Type 2', diagnosedDate: new Date('2018-06-15') }, { condition: 'Arthritis', diagnosedDate: new Date('2020-03-10') }], registeredBy: admin._id },
    { firstName: 'Lakshmi', lastName: 'Devi', dateOfBirth: new Date('1990-01-25'), gender: 'Female', bloodGroup: 'B-', phone: '9900006666', address: { city: 'Hyderabad', state: 'Telangana' }, assignedDoctor: doctors[3]._id, status: 'Active', registeredBy: admin._id },
    { firstName: 'Srikanth', lastName: 'Goud', dateOfBirth: new Date('1972-12-18'), gender: 'Male', bloodGroup: 'A-', phone: '9900007777', address: { city: 'Kukatpally', state: 'Telangana' }, assignedDoctor: doctors[0]._id, status: 'Active', registeredBy: admin._id },
    { firstName: 'Padma', lastName: 'Kumari', dateOfBirth: new Date('1988-04-05'), gender: 'Female', bloodGroup: 'O+', phone: '9900008888', address: { city: 'Ameerpet', state: 'Telangana' }, assignedDoctor: doctors[5]._id, status: 'Active', registeredBy: admin._id }
  ]);
  console.log('✅ Patients created');

  // Create appointments
  const today = new Date();
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);

  const appointments = await Appointment.create([
    { patient: patients[0]._id, doctor: doctors[0]._id, department: departments[0]._id, appointmentDate: today, appointmentTime: '10:00', type: 'Consultation', status: 'Confirmed', symptoms: 'Chest pain and shortness of breath', fee: 800, createdBy: admin._id },
    { patient: patients[1]._id, doctor: doctors[4]._id, department: departments[4]._id, appointmentDate: today, appointmentTime: '11:30', type: 'Follow-up', status: 'Scheduled', symptoms: 'Routine check-up', fee: 750, createdBy: admin._id },
    { patient: patients[2]._id, doctor: doctors[1]._id, department: departments[1]._id, appointmentDate: today, appointmentTime: '14:00', type: 'Consultation', status: 'In Progress', symptoms: 'Severe headaches and dizziness', fee: 900, createdBy: admin._id },
    { patient: patients[3]._id, doctor: doctors[5]._id, department: departments[5]._id, appointmentDate: yesterday, appointmentTime: '09:00', type: 'Routine Checkup', status: 'Completed', fee: 400, diagnosis: 'Healthy, minor vitamin D deficiency', createdBy: admin._id },
    { patient: patients[4]._id, doctor: doctors[2]._id, department: departments[2]._id, appointmentDate: yesterday, appointmentTime: '15:00', type: 'Follow-up', status: 'Completed', fee: 700, diagnosis: 'Knee pain improving, continue physiotherapy', createdBy: admin._id },
    { patient: patients[5]._id, doctor: doctors[3]._id, department: departments[3]._id, appointmentDate: tomorrow, appointmentTime: '10:30', type: 'Consultation', status: 'Scheduled', fee: 500, createdBy: admin._id },
    { patient: patients[6]._id, doctor: doctors[0]._id, department: departments[0]._id, appointmentDate: tomorrow, appointmentTime: '12:00', type: 'Follow-up', status: 'Confirmed', fee: 800, createdBy: admin._id },
    { patient: patients[7]._id, doctor: doctors[5]._id, department: departments[5]._id, appointmentDate: today, appointmentTime: '16:00', type: 'Consultation', status: 'Scheduled', fee: 400, createdBy: admin._id }
  ]);
  console.log('✅ Appointments created');

  // Create bills
  await Billing.create([
    {
      patient: patients[3]._id, appointment: appointments[3]._id,
      items: [
        { description: 'Consultation Fee', category: 'Consultation', quantity: 1, unitPrice: 400 },
        { description: 'Blood Test - CBC', category: 'Lab Test', quantity: 1, unitPrice: 350 },
        { description: 'Vitamin D Test', category: 'Lab Test', quantity: 1, unitPrice: 600 }
      ],
      discount: 100, paidAmount: 1250, paymentStatus: 'Paid', paymentMethod: 'Card', generatedBy: admin._id
    },
    {
      patient: patients[4]._id, appointment: appointments[4]._id,
      items: [
        { description: 'Consultation Fee', category: 'Consultation', quantity: 1, unitPrice: 700 },
        { description: 'X-Ray - Knee', category: 'Lab Test', quantity: 1, unitPrice: 800 },
        { description: 'Physiotherapy Session', category: 'Other', quantity: 3, unitPrice: 500 }
      ],
      paidAmount: 2500, paymentStatus: 'Partial', paymentMethod: 'Cash', generatedBy: admin._id
    },
    {
      patient: patients[0]._id,
      items: [
        { description: 'Consultation Fee', category: 'Consultation', quantity: 1, unitPrice: 800 },
        { description: 'ECG', category: 'Lab Test', quantity: 1, unitPrice: 500 }
      ],
      paidAmount: 0, paymentStatus: 'Pending', generatedBy: admin._id
    }
  ]);
  console.log('✅ Bills created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('📧 Admin Login: admin@hospital.com | Password: Admin@123');
  console.log('📧 Reception Login: reception@hospital.com | Password: Reception@123');
  process.exit(0);
};

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
