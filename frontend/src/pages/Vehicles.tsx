import { useEffect, useState } from 'react';
import { Car, Plus, X, Search } from 'lucide-react';
import { vehicleApi } from '../services/api';
import { useToast } from '../components/Layout';
import type { Vehicle, VehicleType } from '../types';

const TYPE_BADGE: Record<VehicleType, string> = {
  CAR: 'badge-cyan',
  MOTORCYCLE: 'badge-amber',
  TRUCK: 'badge-orange',
};

function RegisterModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ registrationNo: '', type: 'CAR', ownerName: '', phoneNumber: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await vehicleApi.register(form);
      showToast('Vehicle registered successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to register vehicle', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--amber)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>New Entry</div>
            <h2 className="modal-title">Register Vehicle</h2>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm"><X size={14} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Registration Number *</label>
              <input
                className="form-input"
                placeholder="e.g. ABC-1234"
                value={form.registrationNo}
                onChange={e => setForm(p => ({ ...p, registrationNo: e.target.value.toUpperCase() }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Vehicle Type *</label>
              <select className="form-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option value="CAR">Car</option>
                <option value="MOTORCYCLE">Motorcycle</option>
                <option value="TRUCK">Truck</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Owner Name</label>
              <input className="form-input" placeholder="Full name" value={form.ownerName} onChange={e => setForm(p => ({ ...p, ownerName: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" placeholder="555-0100" value={form.phoneNumber} onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registering...' : 'Register Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    vehicleApi.getAll().then(setVehicles).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = vehicles.filter(v =>
    v.registrationNo.toLowerCase().includes(search.toLowerCase()) ||
    (v.ownerName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">Fleet</div>
        <h1 className="page-title">Vehicles</h1>
        <p className="page-desc">Register and manage all vehicles in the system.</p>
      </div>

      <div className="page-body">
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-input"
              style={{ paddingLeft: 34 }}
              placeholder="Search by plate or owner..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Register Vehicle
          </button>
        </div>

        {/* Table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Registered Vehicles</span>
            <span className="badge badge-muted">{filtered.length} total</span>
          </div>
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Registration No.</th>
                  <th>Type</th>
                  <th>Owner</th>
                  <th>Phone</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr className="loading-row"><td colSpan={5}>LOADING VEHICLES...</td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state">
                        <Car size={36} className="empty-icon" />
                        <div className="empty-title">No vehicles found</div>
                        <div className="empty-desc">Register a vehicle to get started.</div>
                      </div>
                    </td>
                  </tr>
                )}
                {filtered.map(v => (
                  <tr key={v.id}>
                    <td><span className="data-mono">{v.registrationNo}</span></td>
                    <td><span className={`badge ${TYPE_BADGE[v.type]}`}>{v.type}</span></td>
                    <td>{v.ownerName || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td><span className="data-mono">{v.phoneNumber || '—'}</span></td>
                    <td><span className="data-mono">{new Date(v.createdAt).toLocaleDateString()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && <RegisterModal onClose={() => setShowModal(false)} onSuccess={load} />}
    </>
  );
}
