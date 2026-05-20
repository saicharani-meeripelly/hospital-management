import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import API from '../utils/api';

const ROOM_TYPES = ['General', 'Semi-Private', 'Private', 'ICU', 'CCU', 'Emergency'];
const ADM_STATUSES = ['Admitted', 'Under Treatment', 'Discharged', 'Transferred'];

const statusColors = { 'Admitted': 'info', 'Under Treatment': 'warning', 'Discharged': 'success', 'Transferred': 'secondary' };

function AdmissionForm({ admission, patients, doctors, departments, onSave, onClose }) {
  const [form, setForm] = useState({
    patient: '', doctor: '', department: '', admissionDate: new Date().toISOString().substring(0, 10),
    admissionReason: '', roomNumber: '', bedNumber: '', roomType: 'General',
    status: 'Admitted', dailyRate: 0, diagnosis: '',
    ...admission,
    patient: admission?.patient?._id || admission?.patient || '',
    doctor: admission?.doctor?._id || admission?.doctor || '',
    department: admission?.department?._id || admission?.department || '',
    admissionDate: admission?.admissionDate ? admission.admissionDate.substring(0, 10) : new Date().toISOString().substring(0, 10),
    dischargeDate: admission?.dischargeDate ? admission.dischargeDate.substring(0, 10) : '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (admission?._id) await API.put(`/admissions/${admission._id}`, form);
      else await API.post('/admissions', form);
      toast.success(`Admission ${admission?._id ? 'updated' : 'created'} successfully!`);
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2>{admission?._id ? '✏️ Edit Admission' : '🏥 New Admission'}</h2>
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
                  {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.firstName} {d.lastName}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-control" value={form.department} onChange={e => set('department', e.target.value)}>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Room Type</label>
                <select className="form-control" value={form.roomType} onChange={e => set('roomType', e.target.value)}>
                  {ROOM_TYPES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group"><label className="form-label">Room Number</label><input className="form-control" value={form.roomNumber} onChange={e => set('roomNumber', e.target.value)} placeholder="e.g. A-201" /></div>
              <div className="form-group"><label className="form-label">Bed Number</label><input className="form-control" value={form.bedNumber} onChange={e => set('bedNumber', e.target.value)} placeholder="e.g. B-3" /></div>
              <div className="form-group"><label className="form-label">Daily Rate (₹)</label><input className="form-control" type="number" min="0" value={form.dailyRate} onChange={e => set('dailyRate', e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Admission Date *</label><input className="form-control" type="date" required value={form.admissionDate} onChange={e => set('admissionDate', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Discharge Date</label><input className="form-control" type="date" value={form.dischargeDate} onChange={e => set('dischargeDate', e.target.value)} /></div>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
                {ADM_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Admission Reason *</label><textarea className="form-control" rows={2} required value={form.admissionReason} onChange={e => set('admissionReason', e.target.value)} placeholder="Reason for admission..." /></div>
            <div className="form-group"><label className="form-label">Diagnosis</label><input className="form-control" value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)} placeholder="Medical diagnosis" /></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳ Saving...' : '💾 Save Admission'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Admissions() {
  const [admissions, setAdmissions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchAdmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (statusFilter) params.append('status', statusFilter);
      const res = await API.get(`/admissions?${params}`);
      setAdmissions(res.data.data); setTotal(res.data.total); setPages(res.data.pages);
    } catch { toast.error('Failed to load admissions'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchAdmissions(); }, [fetchAdmissions]);
  useEffect(() => {
    Promise.all([API.get('/patients?limit=200'), API.get('/doctors?limit=100'), API.get('/departments')])
      .then(([p, d, dep]) => { setPatients(p.data.data); setDoctors(d.data.data); setDepartments(dep.data.data); });
  }, []);

  const activeCount = admissions.filter(a => a.status === 'Admitted' || a.status === 'Under Treatment').length;

  return (
    <div>
      <div className="page-header">
        <div><h1>🏥 Admissions</h1><p>{total} total admissions — {activeCount} currently active</p></div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>➕ New Admission</button>
      </div>

      <div className="card">
        <div className="card-header">
          <select className="form-control" style={{ width: 'auto' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            {ADM_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{total} total</div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? <div className="loading"><div className="spinner" /></div> : admissions.length === 0 ? (
            <div className="empty-state"><div className="icon">🏥</div><h3>No admissions found</h3></div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Adm. ID</th><th>Patient</th><th>Doctor</th><th>Room</th><th>Admitted</th><th>Reason</th><th>Daily Rate</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {admissions.map(a => (
                    <tr key={a._id}>
                      <td><span style={{ fontFamily: 'monospace', fontSize: 12.5, color: 'var(--primary)', fontWeight: 600 }}>{a.admissionId}</span></td>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{a.patient?.firstName} {a.patient?.lastName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.patient?.patientId}</div>
                      </td>
                      <td>Dr. {a.doctor?.firstName} {a.doctor?.lastName}</td>
                      <td>
                        <div style={{ fontSize: 13 }}>{a.roomNumber || '—'} / {a.bedNumber || '—'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.roomType}</div>
                      </td>
                      <td style={{ fontSize: 13 }}>{new Date(a.admissionDate).toLocaleDateString('en-IN')}</td>
                      <td style={{ maxWidth: 160, fontSize: 13 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.admissionReason}</div></td>
                      <td>₹{a.dailyRate}/day</td>
                      <td><span className={`badge badge-${statusColors[a.status] || 'secondary'}`}>{a.status}</span></td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(a); setShowForm(true); }}>✏️</button>
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

      {showForm && <AdmissionForm admission={editing} patients={patients} doctors={doctors} departments={departments} onSave={() => { setShowForm(false); fetchAdmissions(); }} onClose={() => setShowForm(false)} />}
    </div>
  );
}
