import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import API from '../utils/api';

const APT_TYPES = ['Consultation', 'Follow-up', 'Emergency', 'Routine Checkup', 'Surgery', 'Lab Test'];
const APT_STATUSES = ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show'];

const statusColors = {
  'Scheduled': 'secondary', 'Confirmed': 'primary', 'In Progress': 'warning',
  'Completed': 'success', 'Cancelled': 'danger', 'No Show': 'danger'
};

function AppointmentForm({ appointment, patients, doctors, departments, onSave, onClose }) {
  const [form, setForm] = useState({
    patient: '', doctor: '', department: '', appointmentDate: '',
    appointmentTime: '', type: 'Consultation', status: 'Scheduled',
    symptoms: '', notes: '', fee: 0,
    ...appointment,
    patient: appointment?.patient?._id || appointment?.patient || '',
    doctor: appointment?.doctor?._id || appointment?.doctor || '',
    department: appointment?.department?._id || appointment?.department || '',
    appointmentDate: appointment?.appointmentDate ? appointment.appointmentDate.substring(0, 10) : '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (appointment?._id) await API.put(`/appointments/${appointment._id}`, form);
      else await API.post('/appointments', form);
      toast.success(`Appointment ${appointment?._id ? 'updated' : 'booked'} successfully!`);
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2>{appointment?._id ? '✏️ Edit Appointment' : '📅 Book Appointment'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Patient *</label>
                <select className="form-control" required value={form.patient} onChange={e => set('patient', e.target.value)}>
                  <option value="">Select Patient</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.patientId})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Doctor *</label>
                <select className="form-control" required value={form.doctor} onChange={e => set('doctor', e.target.value)}>
                  <option value="">Select Doctor</option>
                  {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.firstName} {d.lastName} - {d.specialization}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input className="form-control" type="date" required value={form.appointmentDate} onChange={e => set('appointmentDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Time *</label>
                <input className="form-control" type="time" required value={form.appointmentTime} onChange={e => set('appointmentTime', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-control" value={form.department} onChange={e => set('department', e.target.value)}>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-control" value={form.type} onChange={e => set('type', e.target.value)}>
                  {APT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
                  {APT_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Symptoms / Reason</label>
              <textarea className="form-control" rows={2} value={form.symptoms} onChange={e => set('symptoms', e.target.value)} placeholder="Describe symptoms..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Consultation Fee (₹)</label>
                <input className="form-control" type="number" min="0" value={form.fee} onChange={e => set('fee', e.target.value)} />
              </div>
              {appointment?._id && (
                <div className="form-group">
                  <label className="form-label">Diagnosis</label>
                  <input className="form-control" value={form.diagnosis || ''} onChange={e => set('diagnosis', e.target.value)} placeholder="Doctor's diagnosis" />
                </div>
              )}
            </div>
            {appointment?._id && (
              <div className="form-group">
                <label className="form-label">Notes / Prescription Notes</label>
                <textarea className="form-control" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳ Saving...' : '💾 Save Appointment'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (statusFilter) params.append('status', statusFilter);
      if (dateFilter) params.append('date', dateFilter);
      const res = await API.get(`/appointments?${params}`);
      setAppointments(res.data.data); setTotal(res.data.total); setPages(res.data.pages);
    } catch { toast.error('Failed to load appointments'); }
    finally { setLoading(false); }
  }, [page, statusFilter, dateFilter]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);
  useEffect(() => {
    Promise.all([
      API.get('/patients?limit=200'), API.get('/doctors?limit=100'), API.get('/departments')
    ]).then(([p, d, dep]) => { setPatients(p.data.data); setDoctors(d.data.data); setDepartments(dep.data.data); });
  }, []);

  const handleDelete = async () => {
    try { await API.delete(`/appointments/${deleteId}`); toast.success('Appointment cancelled'); setDeleteId(null); fetchAppointments(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>📅 Appointments</h1><p>{total} appointments total</p></div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>➕ Book Appointment</button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="filters-row" style={{ margin: 0 }}>
            <input className="form-control" type="date" style={{ width: 'auto' }} value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(1); }} />
            <select className="form-control" style={{ width: 'auto' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              {APT_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            {(dateFilter || statusFilter) && (
              <button className="btn btn-secondary btn-sm" onClick={() => { setDateFilter(''); setStatusFilter(''); setPage(1); }}>✕ Clear</button>
            )}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{total} total</div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? <div className="loading"><div className="spinner" /></div> : appointments.length === 0 ? (
            <div className="empty-state"><div className="icon">📅</div><h3>No appointments found</h3></div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Apt. ID</th><th>Patient</th><th>Doctor</th><th>Date & Time</th><th>Type</th><th>Fee</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a._id}>
                      <td><span style={{ fontFamily: 'monospace', fontSize: 12.5, color: 'var(--primary)', fontWeight: 600 }}>{a.appointmentId}</span></td>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{a.patient?.firstName} {a.patient?.lastName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.patient?.patientId}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Dr. {a.doctor?.firstName} {a.doctor?.lastName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.doctor?.specialization}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{new Date(a.appointmentDate).toLocaleDateString('en-IN')}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>⏰ {a.appointmentTime}</div>
                      </td>
                      <td><span className="badge badge-info">{a.type}</span></td>
                      <td>₹{a.fee}</td>
                      <td><span className={`badge badge-${statusColors[a.status] || 'secondary'}`}>{a.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(a); setShowForm(true); }}>✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(a._id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pages > 1 && (
            <div style={{ padding: '16px 24px' }}>
              <div className="pagination">
                <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
                {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                  <button key={n} className={`page-btn ${n === page ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
                ))}
                <button className="page-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>→</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showForm && <AppointmentForm appointment={editing} patients={patients} doctors={doctors} departments={departments} onSave={() => { setShowForm(false); fetchAppointments(); }} onClose={() => setShowForm(false)} />}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>⚠️ Confirm Delete</h2><button className="close-btn" onClick={() => setDeleteId(null)}>✕</button></div>
            <div className="modal-body"><p style={{ color: 'var(--text-secondary)' }}>Cancel/delete this appointment?</p></div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>No, Keep it</button>
              <button className="btn btn-danger" onClick={handleDelete}>🗑️ Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
