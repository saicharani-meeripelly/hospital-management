# 🏥 MediCore — Hospital Management System

A full-stack Hospital Management System built with **React**, **Node.js/Express**, and **MongoDB**.

---

## 📋 Features

| Module | Features |
|--------|----------|
| 🔐 Authentication | JWT login, role-based access (admin, doctor, nurse, receptionist) |
| 🧑‍⚕️ Patients | Register, search, update, delete patients with full medical history |
| 👨‍⚕️ Doctors | Manage doctors, specializations, schedules, departments |
| 📅 Appointments | Book, update, filter appointments by date/status |
| 🏥 Admissions | Hospital bed management, room types, discharge tracking |
| 💳 Billing | Generate bills, track payments, multi-item invoices |
| 🏢 Departments | Manage hospital departments, beds, services |
| 📊 Dashboard | Real-time stats, charts (patients, appointments, revenue) |

---

## 🛠️ Tech Stack

**Frontend:** React 18, React Router v6, Recharts, Axios, React Toastify  
**Backend:** Node.js, Express.js, Mongoose, JWT, bcryptjs  
**Database:** MongoDB

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

---

### 1. Clone / Setup Backend

```bash
cd hospital-management/backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env and set your MongoDB URI
# MONGODB_URI=mongodb://localhost:27017/hospital_management
# JWT_SECRET=your_secret_key_here

# Seed the database with sample data
npm run seed

# Start the backend server
npm run dev
# Server runs on http://localhost:5000
```

---

### 2. Setup Frontend

```bash
cd hospital-management/frontend

# Install dependencies
npm install

# Start the React app
npm start
# App runs on http://localhost:3000
```

---

### 3. Login Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hospital.com | Admin@123 |
| Receptionist | reception@hospital.com | Reception@123 |
| Nurse | nurse@hospital.com | Nurse@123 |

---

## 📁 Project Structure

```
hospital-management/
├── backend/
│   ├── models/
│   │   ├── User.js          # Auth user model
│   │   ├── Patient.js       # Patient model
│   │   ├── Doctor.js        # Doctor model
│   │   ├── Appointment.js   # Appointment model
│   │   ├── Admission.js     # Admission/bed model
│   │   ├── Billing.js       # Billing/invoice model
│   │   └── Department.js    # Department model
│   ├── routes/
│   │   ├── auth.js          # Login, register, profile
│   │   ├── patients.js      # Patient CRUD
│   │   ├── doctors.js       # Doctor CRUD
│   │   ├── appointments.js  # Appointment CRUD
│   │   ├── admissions.js    # Admission CRUD
│   │   ├── billing.js       # Billing CRUD
│   │   ├── departments.js   # Department CRUD
│   │   └── dashboard.js     # Stats & analytics
│   ├── middleware/
│   │   └── auth.js          # JWT protect & authorize
│   ├── seed.js              # Sample data seeder
│   ├── server.js            # Express entry point
│   ├── .env.example         # Environment variables template
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Layout.js    # App shell with topbar
    │   │   └── Sidebar.js   # Navigation sidebar
    │   ├── context/
    │   │   └── AuthContext.js  # Auth state management
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Dashboard.js
    │   │   ├── Patients.js
    │   │   ├── Doctors.js
    │   │   ├── Appointments.js
    │   │   ├── Admissions.js
    │   │   ├── Billing.js
    │   │   └── Departments.js
    │   ├── utils/
    │   │   └── api.js       # Axios instance with interceptors
    │   ├── App.js           # Routes & providers
    │   ├── index.js         # React entry point
    │   └── index.css        # Global design system
    └── package.json
```

---

## 🔌 API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/profile
PUT    /api/auth/change-password
```

### Patients
```
GET    /api/patients?search=&status=&page=&limit=
GET    /api/patients/:id
POST   /api/patients
PUT    /api/patients/:id
DELETE /api/patients/:id
```

### Doctors, Appointments, Admissions, Billing, Departments
```
GET / POST / PUT / DELETE  /api/doctors
GET / POST / PUT / DELETE  /api/appointments
GET / POST / PUT           /api/admissions
GET / POST / PUT           /api/billing
GET / POST / PUT / DELETE  /api/departments
```

### Dashboard
```
GET    /api/dashboard/stats
GET    /api/dashboard/revenue
```

---

## 🔧 Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hospital_management
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

---

## ☁️ Deploying to Production

### Backend (Render / Railway / Heroku)
1. Set environment variables in your hosting dashboard
2. Set `NODE_ENV=production`
3. Deploy `backend/` folder

### Frontend (Vercel / Netlify)
1. Set `REACT_APP_API_URL=https://your-backend-url.com/api`
2. Deploy `frontend/` folder
3. Add proxy or CORS config for your domain

### MongoDB Atlas (Cloud)
- Replace `MONGODB_URI` with your Atlas connection string

---

## 📝 Notes

- All API routes are protected with JWT authentication
- Patient IDs are auto-generated (PAT00001, PAT00002...)
- Doctor IDs are auto-generated (DOC0001, DOC0002...)
- Bills automatically calculate subtotal, tax, discount, and balance
- The seeder creates 7 departments, 7 doctors, 8 patients, 8 appointments, and 3 bills

---

Built with ❤️ — MediCore HMS v1.0
