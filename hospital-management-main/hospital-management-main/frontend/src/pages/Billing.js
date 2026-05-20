import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import API from '../utils/api';

const PAYMENT_STATUSES = ['Pending', 'Partial', 'Paid', 'Overdue', 'Cancelled'];
const PAYMENT_METHODS = ['Cash', 'Card', 'Insurance', 'Online', 'Cheque'];
const ITEM_CATEGORIES = ['Consultation', 'Room Charges', 'Medicine', 'Lab Test', 'Surgery', 'Nursing', 'Other'];

const statusColors = { Pending: 'warning', Partial: 'info', Paid: 'success', Overdue: 'danger', Cancelled: 'secondary' };

function BillingForm({ bill, patients, onSave, onClose }) {
  const [form, setForm] = useState({
    patient: '', paymentMethod: 'Cash', paymentStatus: 'Pending',
    discount: 0, tax: 0, paidAmount: 0, notes: '',
    items: [{ description: '', category: 'Consultation', quantity: 1, unitPrice: 0 }],
    ...bill,
    patient: bill?.patient?._id || bill?.patient || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { description: '', category: 'Consultation', quantity: 1, unitPrice: 0 }] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const setItem = (i, k, v) => setForm(f => ({ ...f, items: f.items.map((item, idx) => idx === i ? { ...item, [k]: v } : item) }));

  const subtotal = form.items.reduce((s, i) => s + (Number(i.quantity) * Number(i.unitPrice)), 0);
  const total = subtotal - Number(form.discount) + Number(form.tax);
  const balance = total - Number(form.paidAmount);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (bill?._id) await API.put(`/billing/${bill._id}`, form);
      else await API.post('/billing', form);
      toast.success('Bill saved successfully!'); onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2>{bill?._id ? '✏️ Edit Bill' : '💳 Generate Bill'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Patient *</label>
              <select className="form-control" required value={form.patient} onChange={e => set('patient', e.target.value)}>
                <option value="">Select Patient</option>
                {patients.map(p => <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.patientId})</option>)}
              </select>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Bill Items</div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>➕ Add Item</button>
              </div>
              {form.items.map((item, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'flex-end' }}>
                  <div>
                    {i === 0 && <label className="form-label">Description</label>}
                    <input className="form-control" required value={item.description} onChange={e => setItem(i, 'description', e.target.value)} placeholder="Service/item description" />
                  </div>
                  <div>
                    {i === 0 && <label className="form-label">Category</label>}
                    <select className="form-control" value={item.category} onChange={e => setItem(i, 'category', e.target.value)}>
                      {ITEM_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    {i === 0 && <label className="form-label">Qty</label>}
                    <input className="form-control" type="number" min="1" value={item.quantity} onChange={e => setItem(i, 'quantity', e.target.value)} />
                  </div>
                  <div>
                    {i === 0 && <label className="form-label">Unit Price (₹)</label>}
                    <input className="form-control" type="number" min="0" value={item.unitPrice} onChange={e => setItem(i, 'unitPrice', e.target.value)} />
                  </div>
                  <div style={{ paddingBottom: 1 }}>
                    {i === 0 && <div style={{ marginBottom: 6 }}>&nbsp;</div>}
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(i)} disabled={form.items.length === 1}>✕</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Discount (₹)</span>
                <input type="number" min="0" value={form.discount} onChange={e => set('discount', e.target.value)} style={{ width: 100, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, textAlign: 'right' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tax (₹)</span>
                <input type="number" min="0" value={form.tax} onChange={e => set('tax', e.target.value)} style={{ width: 100, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, textAlign: 'right' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                <span>Total</span><span style={{ color: 'var(--primary)' }}>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group"><label className="form-label">Payment Method</label>
                <select className="form-control" value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
                  {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Paid Amount (₹)</label>
                <input className="form-control" type="number" min="0" max={total} value={form.paidAmount} onChange={e => set('paidAmount', e.target.value)} />
              </div>
              <div className="form-group"><label className="form-label">Balance (₹)</label>
                <input className="form-control" readOnly value={balance.toFixed(2)} style={{ background: 'var(--surface-2)', fontWeight: 600, color: balance > 0 ? 'var(--danger)' : 'var(--success)' }} />
              </div>
            </div>

            <div className="form-group"><label className="form-label">Notes</label><textarea className="form-control" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳ Saving...' : '💾 Save Bill'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (statusFilter) params.append('paymentStatus', statusFilter);
      const res = await API.get(`/billing?${params}`);
      setBills(res.data.data); setTotal(res.data.total); setPages(res.data.pages);
    } catch { toast.error('Failed to load bills'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchBills(); }, [fetchBills]);
  useEffect(() => { API.get('/patients?limit=200').then(r => setPatients(r.data.data)); }, []);

  const totalRevenue = bills.filter(b => b.paymentStatus === 'Paid').reduce((s, b) => s + b.paidAmount, 0);
  const totalPending = bills.filter(b => ['Pending', 'Partial'].includes(b.paymentStatus)).reduce((s, b) => s + b.balance, 0);

  return (
    <div>
      <div className="page-header">
        <div><h1>💳 Billing</h1><p>{total} bills generated</p></div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>➕ Generate Bill</button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#f0fdf4' }}>💰</div><div className="stat-info"><div className="value" style={{ fontSize: 20 }}>₹{totalRevenue.toLocaleString()}</div><div className="label">Revenue (Current View)</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#fef2f2' }}>⏳</div><div className="stat-info"><div className="value" style={{ fontSize: 20 }}>₹{totalPending.toLocaleString()}</div><div className="label">Pending (Current View)</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--primary-light)' }}>📄</div><div className="stat-info"><div className="value" style={{ fontSize: 20 }}>{total}</div><div className="label">Total Bills</div></div></div>
      </div>

      <div className="card">
        <div className="card-header">
          <select className="form-control" style={{ width: 'auto' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            {PAYMENT_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{total} bills</div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? <div className="loading"><div className="spinner" /></div> : bills.length === 0 ? (
            <div className="empty-state"><div className="icon">💳</div><h3>No bills found</h3></div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Bill ID</th><th>Patient</th><th>Date</th><th>Total</th><th>Paid</th><th>Balance</th><th>Method</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {bills.map(b => (
                    <tr key={b._id}>
                      <td><span style={{ fontFamily: 'monospace', fontSize: 12.5, color: 'var(--primary)', fontWeight: 600 }}>{b.billId}</span></td>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{b.patient?.firstName} {b.patient?.lastName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.patient?.patientId}</div>
                      </td>
                      <td style={{ fontSize: 13 }}>{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                      <td style={{ fontWeight: 600 }}>₹{b.totalAmount?.toFixed(2)}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 500 }}>₹{b.paidAmount?.toFixed(2)}</td>
                      <td style={{ color: b.balance > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>₹{b.balance?.toFixed(2)}</td>
                      <td>{b.paymentMethod || '—'}</td>
                      <td><span className={`badge badge-${statusColors[b.paymentStatus] || 'secondary'}`}>{b.paymentStatus}</span></td>
                      <td><button className="btn btn-secondary btn-sm" onClick={() => { setEditing(b); setShowForm(true); }}>✏️</button></td>
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

      {showForm && <BillingForm bill={editing} patients={patients} onSave={() => { setShowForm(false); fetchBills(); }} onClose={() => setShowForm(false)} />}
    </div>
  );
}
