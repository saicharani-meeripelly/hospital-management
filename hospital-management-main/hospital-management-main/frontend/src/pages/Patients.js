import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import API from '../utils/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['Male', 'Female', 'Other'];

function PatientForm({ patient, doctors, onSave, onClose }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', dateOfBirth: '', gender: 'Male',
    bloodGroup: 'O+', phone: '', email: '',
    address: { street: '', city: '', state: '', zipCode: '' },
    emergencyContact: { name: '', relationship: '', phone: '' },
    assignedDoctor: '', status: 'Active', allergies: '',
    ...patient,
    dateOfBirth: patient?.dateOfBirth ? patient.dateOfBirth.substring(0, 10) : '',
    allergies: patient?.allergies?.join(', ') || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setAddr = (k, v) => setForm(f => ({ ...f, address: { ...f.address, [k]: v } }));
  const setEmerg = (k, v) => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, [k]: v } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, allergies: form.allergies.split(',').map(a => a.trim()).filter(Boolean) };
      if (patient?._id) await API.put(`/patients/${patient._id}`, payload);
      else await API.post('/patients', payload);
      toast.success(`Patient ${patient?._id ? 'updated' : 'registered'} successfully!`);
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save patient');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2>{patient?._id ? '✏️ Edit Patient' : '➕ Register New Patient'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="tabs" style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', padding: '0 0 8px', borderBottom: '2px solid var(--primary)' }}>Personal Information</div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input className="form-control" required value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="First name" />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input className="form-control" required value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Last name" />
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Date of Birth *</label>
                <input className="form-control" type="date" required value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender *</label>
                <select className="form-control" required value={form.gender} onChange={e => set('gender', e.target.value)}>
                  {GENDERS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select className="form-control" value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}>
                  {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="form-control" required value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="10-digit phone number" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-control" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="Email address" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Assigned Doctor</label>
                <select className="form-control" value={form.assignedDoctor} onChange={e => set('assignedDoctor', e.target.value)}>
                  <option value="">Select Doctor</option>
                  {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.firstName} {d.lastName} - {d.specialization}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
                  {['Active', 'Inactive', 'Discharged'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Allergies (comma-separated)</label>
              <input className="form-control" value={form.allergies} onChange={e => set('allergies', e.target.value)} placeholder="e.g. Penicillin, Aspirin" />
            </div>
            <div style={{ marginTop: 4, marginBottom: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Address</div>
              <div className="form-group">
                <label className="form-label">Street</label>
                <input className="form-control" value={form.address?.street || ''} onChange={e => setAddr('street', e.target.value)} placeholder="Street address" />
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-control" value={form.address?.city || ''} onChange={e => setAddr('city', e.target.value)} placeholder="City" />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input className="form-control" value={form.address?.state || ''} onChange={e => setAddr('state', e.target.value)} placeholder="State" />
                </div>
                <div className="form-group">
                  <label className="form-label">ZIP Code</label>
                  <input className="form-control" value={form.address?.zipCode || ''} onChange={e => setAddr('zipCode', e.target.value)} placeholder="ZIP" />
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Emergency Contact</div>
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-control" value={form.emergencyContact?.name || ''} onChange={e => setEmerg('name', e.target.value)} placeholder="Contact name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Relationship</label>
                  <input className="form-control" value={form.emergencyContact?.relationship || ''} onChange={e => setEmerg('relationship', e.target.value)} placeholder="Spouse, Parent..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-control" value={form.emergencyContact?.phone || ''} onChange={e => setEmerg('phone', e.target.value)} placeholder="Phone number" />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '⏳ Saving...' : '💾 Save Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const statusBadge = (s) => {
  const map = { Active: 'success', Inactive: 'warning', Discharged: 'secondary' };
  return <span className={`badge badge-${map[s] || 'secondary'}`}>{s}</span>;
};

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const res = await API.get(`/patients?${params}`);
      setPatients(res.data.data);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch { toast.error('Failed to load patients'); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  useEffect(() => {
    API.get('/doctors?limit=100').then(r => setDoctors(r.data.data));
  }, []);

  const handleDelete = async () => {
    try {
      await API.delete(`/patients/${deleteId}`);
      toast.success('Patient deleted');
      setDeleteId(null);
      fetchPatients();
    } catch { toast.error('Failed to delete patient'); }
  };

  const calcAge = (dob) => {
    if (!dob) return '—';
    const d = new Date(dob);
    const age = new Date().getFullYear() - d.getFullYear();
    return age;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>🧑‍⚕️ Patients</h1>
          <p>{total} patients registered</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingPatient(null); setShowForm(true); }}>
          ➕ Register Patient
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="filters-row" style={{ margin: 0 }}>
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                placeholder="Search by name, ID, phone..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select className="form-control" style={{ width: 'auto' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Discharged</option>
            </select>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Showing {patients.length} of {total}</div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : patients.length === 0 ? (
            <div className="empty-state"><div className="icon">🧑‍⚕️</div><h3>No patients found</h3><p>Try adjusting your search filters.</p></div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Name</th>
                    <th>Age / Gender</th>
                    <th>Blood Group</th>
                    <th>Phone</th>
                    <th>Assigned Doctor</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p._id}>
                      <td><span style={{ fontFamily: 'monospace', fontSize: 12.5, color: 'var(--primary)', fontWeight: 600 }}>{p.patientId}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar" style={{ background: `hsl(${p.firstName?.charCodeAt(0) * 7}, 60%, 50%)`, fontSize: 12, width: 32, height: 32 }}>
                            {p.firstName?.charAt(0)}{p.lastName?.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{p.firstName} {p.lastName}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{calcAge(p.dateOfBirth)} yrs / {p.gender}</td>
                      <td><span className="badge badge-info">{p.bloodGroup}</span></td>
                      <td>{p.phone}</td>
                      <td>{p.assignedDoctor ? `Dr. ${p.assignedDoctor.firstName} ${p.assignedDoctor.lastName}` : '—'}</td>
                      <td>{statusBadge(p.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => { setEditingPatient(p); setShowForm(true); }}>✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(p._id)}>🗑️</button>
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

      {showForm && (
        <PatientForm
          patient={editingPatient}
          doctors={doctors}
          onSave={() => { setShowForm(false); fetchPatients(); }}
          onClose={() => setShowForm(false)}
        />
      )}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>⚠️ Confirm Delete</h2><button className="close-btn" onClick={() => setDeleteId(null)}>✕</button></div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }}>Are you sure you want to delete this patient? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>🗑️ Delete Patient</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
