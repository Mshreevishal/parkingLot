import { useEffect, useState } from 'react';
import { ParkingSquare, Plus, X, Wrench } from 'lucide-react';
import { slotApi } from '../services/api';
import { useToast } from '../components/Layout';
import type { ParkingSlot, SlotStatus, VehicleType } from '../types';

const STATUS_BADGE: Record<SlotStatus, string> = {
  AVAILABLE: 'badge-green',
  OCCUPIED: 'badge-red',
  MAINTENANCE: 'badge-orange',
};

// Hard-coded for demo; in production this would come from an API call
const DEMO_LOT_ID_PLACEHOLDER = ''; // Will be set dynamically

function CreateSlotModal({ onClose, onSuccess, parkingLotId }: { onClose: () => void; onSuccess: () => void; parkingLotId: string }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ slotNumber: '', type: 'CAR' as VehicleType });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parkingLotId) { showToast('No parking lot found. Please seed the database first.', 'error'); return; }
    setLoading(true);
    try {
      await slotApi.create({ ...form, parkingLotId });
      showToast('Slot created!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to create slot', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--amber)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>New Slot</div>
            <h2 className="modal-title">Create Parking Slot</h2>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm"><X size={14} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Slot Number *</label>
              <input className="form-input" placeholder="e.g. A4" value={form.slotNumber} onChange={e => setForm(p => ({ ...p, slotNumber: e.target.value.toUpperCase() }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Vehicle Type *</label>
              <select className="form-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as VehicleType }))}>
                <option value="CAR">Car</option>
                <option value="MOTORCYCLE">Motorcycle</option>
                <option value="TRUCK">Truck</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Slot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Slots() {
  const { showToast } = useToast();
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [parkingLotId, setParkingLotId] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    slotApi.getAll().then(data => {
      setSlots(data);
      if (data[0]) setParkingLotId(data[0].parkingLotId);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const setMaintenance = async (slot: ParkingSlot) => {
    if (slot.status === 'OCCUPIED') { showToast('Cannot set an occupied slot to maintenance.', 'error'); return; }
    const next = slot.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
    setUpdatingId(slot.id);
    try {
      await slotApi.updateStatus(slot.id, next);
      showToast(`Slot ${slot.slotNumber} set to ${next}`, 'info');
      load();
    } catch {
      showToast('Failed to update slot status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">Infrastructure</div>
        <h1 className="page-title">Parking Slots</h1>
        <p className="page-desc">Manage all parking slots and their current status.</p>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid">
          {(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'] as SlotStatus[]).map(status => {
            const count = slots.filter(s => s.status === status).length;
            const color = status === 'AVAILABLE' ? 'green' : status === 'OCCUPIED' ? 'red' : 'amber';
            return (
              <div key={status} className={`stat-card ${color}`}>
                <div className="stat-label">{status}</div>
                <div className="stat-value">{count}</div>
                <div className="stat-sub">of {slots.length} total</div>
              </div>
            );
          })}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Add Slot
          </button>
        </div>

        {/* Table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">All Slots</span>
            <span className="badge badge-muted">{slots.length} total</span>
          </div>
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Slot No.</th>
                  <th>Type</th>
                  <th>Parking Lot</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr className="loading-row"><td colSpan={5}>LOADING SLOTS...</td></tr>}
                {!loading && slots.length === 0 && (
                  <tr><td colSpan={5}>
                    <div className="empty-state">
                      <ParkingSquare size={36} className="empty-icon" />
                      <div className="empty-title">No slots yet</div>
                      <div className="empty-desc">Create your first parking slot.</div>
                    </div>
                  </td></tr>
                )}
                {slots.map(slot => (
                  <tr key={slot.id}>
                    <td><span className="data-mono">{slot.slotNumber}</span></td>
                    <td>
                      <span className={`badge ${slot.type === 'CAR' ? 'badge-cyan' : slot.type === 'MOTORCYCLE' ? 'badge-amber' : 'badge-orange'}`}>
                        {slot.type}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{slot.parkingLot?.name || '—'}</td>
                    <td><span className={`badge ${STATUS_BADGE[slot.status]}`}>{slot.status}</span></td>
                    <td>
                      <button
                        className={`btn btn-sm ${slot.status === 'MAINTENANCE' ? 'btn-success' : 'btn-secondary'}`}
                        onClick={() => setMaintenance(slot)}
                        disabled={slot.status === 'OCCUPIED' || updatingId === slot.id}
                      >
                        <Wrench size={12} />
                        {slot.status === 'MAINTENANCE' ? 'Restore' : 'Maintenance'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && <CreateSlotModal onClose={() => setShowModal(false)} onSuccess={load} parkingLotId={parkingLotId} />}
    </>
  );
}
