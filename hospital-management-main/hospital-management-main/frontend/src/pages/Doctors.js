import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import API from '../utils/api';

function DoctorForm({ doctor, departments, onSave, onClose }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', specialization: '', department: '',
    experience: 0, phone: '', email: '', consultationFee: 0,
    qualification: '', isAvailable: true, bio: '',
    ...doctor,
    qualification: doctor?.qualification?.join(', ') || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, qualification: form.qualification.split(',').map(q => q.trim()).filter(Boolean) };
      if (doctor?._id) await API.put(`/doctors/${doctor._id}`, payload);
      else await API.post('/doctors', payload);
      toast.success(`Doctor ${doctor?._id ? 'updated' : 'added'} successfully!`);
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save doctor'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2>{doctor?._id ? '✏️ Edit Doctor' : '➕ Add New Doctor'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group"><label className="form-label">First Name *</label><input className="form-control" required value={form.firstName} onChange={e => set('firstName', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Last Name *</label><input className="form-control" required value={form.lastName} onChange={e => set('lastName', e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Specialization *</label><input className="form-control" required value={form.specialization} onChange={e => set('specialization', e.target.value)} placeholder="e.g. Cardiologist" /></div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-control" value={form.department} onChange={e => set('department', e.target.value)}>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group"><label className="form-label">Experience (years)</label><input className="form-control" type="number" min="0" value={form.experience} onChange={e => set('experience', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Consultation Fee (₹)</label><input className="form-control" type="number" min="0" value={form.consultationFee} onChange={e => set('consultationFee', e.target.value)} /></div>
              <div className="form-group">
                <label className="form-label">Availability</label>
                <select className="form-control" value={form.isAvailable} onChange={e => set('isAvailable', e.target.value === 'true')}>
                  <option value="true">Available</option>
                  <option value="false">Not Available</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-control" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
            </div>
            <div className="form-group"><label className="form-label">Qualifications (comma-separated)</label><input className="form-control" value={form.qualification} onChange={e => set('qualification', e.target.value)} placeholder="MBBS, MD Cardiology" /></div>
            <div className="form-group"><label className="form-label">Bio</label><textarea className="form-control" rows={3} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Brief biography..." /></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳ Saving...' : '💾 Save Doctor'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.append('search', search);
      const res = await API.get(`/doctors?${params}`);
      setDoctors(res.data.data); setTotal(res.data.total); setPages(res.data.pages);
    } catch { toast.error('Failed to load doctors'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);
  useEffect(() => { API.get('/departments').then(r => setDepartments(r.data.data)); }, []);

  const handleDelete = async () => {
    try { await API.delete(`/doctors/${deleteId}`); toast.success('Doctor removed'); setDeleteId(null); fetchDoctors(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>👨‍⚕️ Doctors</h1><p>{total} doctors registered</p></div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>➕ Add Doctor</button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input placeholder="Search by name, ID..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{total} total</div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? <div className="loading"><div className="spinner" /></div> : doctors.length === 0 ? (
            <div className="empty-state"><div className="icon">👨‍⚕️</div><h3>No doctors found</h3></div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Doctor ID</th><th>Name</th><th>Specialization</th><th>Department</th>
                    <th>Experience</th><th>Fee</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map(d => (
                    <tr key={d._id}>
                      <td><span style={{ fontFamily: 'monospace', fontSize: 12.5, color: 'var(--primary)', fontWeight: 600 }}>{d.doctorId}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', fontSize: 12, width: 32, height: 32 }}>
                            {d.firstName?.charAt(0)}{d.lastName?.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Dr. {d.firstName} {d.lastName}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{d.specialization}</td>
                      <td>{d.department?.name || '—'}</td>
                      <td>{d.experience} yrs</td>
                      <td>₹{d.consultationFee}</td>
                      <td><span className={`badge badge-${d.isAvailable ? 'success' : 'warning'}`}>{d.isAvailable ? 'Available' : 'Unavailable'}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(d); setShowForm(true); }}>✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(d._id)}>🗑️</button>
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

      {showForm && <DoctorForm doctor={editing} departments={departments} onSave={() => { setShowForm(false); fetchDoctors(); }} onClose={() => setShowForm(false)} />}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>⚠️ Confirm Delete</h2><button className="close-btn" onClick={() => setDeleteId(null)}>✕</button></div>
            <div className="modal-body"><p style={{ color: 'var(--text-secondary)' }}>Remove this doctor from the system?</p></div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>🗑️ Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
