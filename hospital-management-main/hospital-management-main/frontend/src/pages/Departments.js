import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../utils/api';

function DeptForm({ dept, onSave, onClose }) {
  const [form, setForm] = useState({
    name: '', code: '', description: '', location: '', phone: '',
    totalBeds: 0, availableBeds: 0, services: '', isActive: true,
    ...dept, services: dept?.services?.join(', ') || ''
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, services: form.services.split(',').map(s => s.trim()).filter(Boolean) };
      if (dept?._id) await API.put(`/departments/${dept._id}`, payload);
      else await API.post('/departments', payload);
      toast.success('Department saved!'); onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{dept?._id ? '✏️ Edit Department' : '➕ Add Department'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group"><label className="form-label">Name *</label><input className="form-control" required value={form.name} onChange={e => set('name', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Code *</label><input className="form-control" required value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="e.g. CARD" /></div>
            </div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={2} value={form.description} onChange={e => set('description', e.target.value)} /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Location</label><input className="form-control" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Block A, Floor 2" /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Total Beds</label><input className="form-control" type="number" min="0" value={form.totalBeds} onChange={e => set('totalBeds', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Available Beds</label><input className="form-control" type="number" min="0" value={form.availableBeds} onChange={e => set('availableBeds', e.target.value)} /></div>
            </div>
            <div className="form-group"><label className="form-label">Services (comma-separated)</label><input className="form-control" value={form.services} onChange={e => set('services', e.target.value)} placeholder="ECG, MRI, X-Ray" /></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳ Saving...' : '💾 Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchDepts = async () => {
    setLoading(true);
    try { const res = await API.get('/departments'); setDepartments(res.data.data); }
    catch { toast.error('Failed to load departments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDepts(); }, []);

  const handleDelete = async () => {
    try { await API.delete(`/departments/${deleteId}`); toast.success('Department deleted'); setDeleteId(null); fetchDepts(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>🏢 Departments</h1><p>{departments.length} departments</p></div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>➕ Add Department</button>
      </div>

      {loading ? <div className="loading"><div className="spinner" /></div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {departments.map(d => (
            <div key={d._id} className="card" style={{ transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 20 }}>🏥</span>
                      <h3 style={{ fontSize: 15, fontWeight: 700 }}>{d.name}</h3>
                    </div>
                    <span className="badge badge-primary">{d.code}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(d); setShowForm(true); }}>✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(d._id)}>🗑️</button>
                  </div>
                </div>

                {d.description && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{d.description}</p>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Total Beds</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{d.totalBeds}</div>
                  </div>
                  <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Available</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)' }}>{d.availableBeds}</div>
                  </div>
                </div>

                {d.location && <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 8 }}>📍 {d.location}</div>}
                {d.phone && <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 8 }}>📞 {d.phone}</div>}
                {d.services?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {d.services.map((s, i) => <span key={i} className="badge badge-secondary" style={{ fontSize: 11 }}>{s}</span>)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <DeptForm dept={editing} onSave={() => { setShowForm(false); fetchDepts(); }} onClose={() => setShowForm(false)} />}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>⚠️ Confirm Delete</h2><button className="close-btn" onClick={() => setDeleteId(null)}>✕</button></div>
            <div className="modal-body"><p style={{ color: 'var(--text-secondary)' }}>Delete this department?</p></div>
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
