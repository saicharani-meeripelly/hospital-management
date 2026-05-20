import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#0ea5e9', '#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];

const StatCard = ({ icon, label, value, color, change }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: color + '18', fontSize: 24 }}>{icon}</div>
    <div className="stat-info">
      <div className="value">{value}</div>
      <div className="label">{label}</div>
      {change && <div className="change change-up">{change}</div>}
    </div>
  </div>
);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard/stats')
      .then(res => setStats(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!stats) return null;

  const aptByStatus = (stats.appointmentsByStatus || []).map(s => ({ name: s._id, value: s.count }));
  const monthlyData = (stats.monthlyPatients || []).map(m => ({ month: MONTHS[m._id - 1], patients: m.count }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Here's what's happening at the hospital today</p>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'right' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon="🧑‍⚕️" label="Total Patients" value={stats.totalPatients} color="#0ea5e9" change="Active patients" />
        <StatCard icon="👨‍⚕️" label="Available Doctors" value={stats.totalDoctors} color="#6366f1" />
        <StatCard icon="📅" label="Today's Appointments" value={stats.todayAppointments} color="#22c55e" />
        <StatCard icon="🏥" label="Current Admissions" value={stats.activeAdmissions} color="#f59e0b" />
        <StatCard icon="💰" label="Monthly Revenue" value={`₹${(stats.monthlyRevenue || 0).toLocaleString()}`} color="#22c55e" />
        <StatCard icon="⏳" label="Pending Bills" value={`₹${(stats.pendingBills || 0).toLocaleString()}`} color="#ef4444" />
      </div>

      <div className="charts-grid">
        {/* Monthly patients chart */}
        <div className="card chart-full">
          <div className="card-header">
            <h3 className="card-title">📈 Patient Registrations (This Year)</h3>
          </div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', fontSize: 13 }} />
                  <Bar dataKey="patients" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Patients" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state"><div className="icon">📊</div><p>No patient data yet. Seed the database to see charts.</p></div>
            )}
          </div>
        </div>

        {/* Appointments by status */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📅 Appointments by Status</h3>
          </div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            {aptByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={aptByStatus} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {aptByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state"><div className="icon">📅</div><p>No appointments yet.</p></div>
            )}
          </div>
        </div>

        {/* Recent patients */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🆕 Recent Patients</h3>
          </div>
          <div className="card-body" style={{ paddingTop: 12 }}>
            {(stats.recentPatients || []).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stats.recentPatients.map(p => (
                  <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="avatar" style={{ background: `hsl(${p.firstName.charCodeAt(0) * 7}, 60%, 50%)`, fontSize: 12, width: 36, height: 36 }}>
                      {p.firstName?.charAt(0)}{p.lastName?.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>{p.firstName} {p.lastName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.patientId}</div>
                    </div>
                    <span className={`badge badge-${p.status === 'Active' ? 'success' : 'secondary'}`}>{p.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state"><div className="icon">👤</div><p>No patients registered yet.</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
