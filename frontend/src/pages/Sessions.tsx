import { useEffect, useState } from 'react';
import { Activity, LogIn, LogOut, X, DollarSign } from 'lucide-react';
import { vehicleApi, slotApi, sessionApi } from '../services/api';
import { useToast } from '../components/Layout';
import type { ParkingSession, Vehicle, ParkingSlot } from '../types';

// ── Entry Modal ────────────────────────────────────────────────────────────────
function EntryModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { showToast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [vehicleId, setVehicleId] = useState('');
  const [slotId, setSlotId] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    Promise.all([vehicleApi.getAll(), slotApi.getAll()])
      .then(([v, s]) => {
        setVehicles(v);
        setSlots(s.filter(x => x.status === 'AVAILABLE'));
      })
      .finally(() => setDataLoading(false));
  }, []);

  // Filter slots to match selected vehicle type
  const selectedVehicle = vehicles.find(v => v.id === vehicleId);
  const compatibleSlots = selectedVehicle
    ? slots.filter(s => s.type === selectedVehicle.type)
    : slots;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !slotId) { showToast('Please select a vehicle and slot.', 'error'); return; }
    setLoading(true);
    try {
      await sessionApi.create({ vehicleId, slotId });
      showToast('Vehicle parked successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? err.message : 'Failed to create session';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--green)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Vehicle Entry</div>
            <h2 className="modal-title">Park a Vehicle</h2>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm"><X size={14} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {dataLoading ? (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>LOADING DATA...</div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Select Vehicle *</label>
                  <select className="form-select" value={vehicleId} onChange={e => { setVehicleId(e.target.value); setSlotId(''); }} required>
                    <option value="">-- Choose vehicle --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.registrationNo} — {v.type}{v.ownerName ? ` (${v.ownerName})` : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Select Available Slot *
                    {selectedVehicle && <span style={{ marginLeft: 6, color: 'var(--amber)' }}>(Showing {selectedVehicle.type} slots)</span>}
                  </label>
                  <select className="form-select" value={slotId} onChange={e => setSlotId(e.target.value)} required disabled={!vehicleId}>
                    <option value="">-- Choose slot --</option>
                    {compatibleSlots.map(s => (
                      <option key={s.id} value={s.id}>{s.slotNumber} — {s.type}</option>
                    ))}
                  </select>
                  {vehicleId && compatibleSlots.length === 0 && (
                    <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                      No compatible slots available for this vehicle type.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || dataLoading || !vehicleId || !slotId}>
              <LogIn size={14} />{loading ? 'Parking...' : 'Park Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Exit Modal ─────────────────────────────────────────────────────────────────
function ExitModal({ session, onClose, onSuccess }: { session: ParkingSession; onClose: () => void; onSuccess: () => void }) {
  const { showToast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [loading, setLoading] = useState(false);

  // Preview fee
  const hours = Math.max(1, Math.ceil((Date.now() - new Date(session.entryTime).getTime()) / (1000 * 60 * 60)));
  const previewFee = 5 + (hours - 1) * 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await sessionApi.complete(session.id, paymentMethod);
      showToast(`Session closed. Fee collected: $${result.payment.amount.toFixed(2)}`, 'success');
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? err.message : 'Failed to complete session';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const duration = Math.round((Date.now() - new Date(session.entryTime).getTime()) / 60000);
  const h = Math.floor(duration / 60), m = duration % 60;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--red)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Vehicle Exit</div>
            <h2 className="modal-title">Complete Session</h2>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm"><X size={14} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Summary */}
            <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-md)', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>VEHICLE</span>
                <span className="data-mono">{session.vehicle.registrationNo}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>SLOT</span>
                <span className="data-mono">{session.slot.slotNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>DURATION</span>
                <span className="data-mono" style={{ color: 'var(--amber)' }}>{h > 0 ? `${h}h ` : ''}{m}m</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border-dim)', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>EST. FEE</span>
                <span style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>${previewFee.toFixed(2)}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method *</label>
              <select className="form-select" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="ONLINE">Online</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <DollarSign size={14} />{loading ? 'Processing...' : `Collect $${previewFee.toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Sessions Page ──────────────────────────────────────────────────────────────
export default function Sessions() {
  const [sessions, setSessions] = useState<ParkingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEntry, setShowEntry] = useState(false);
  const [exitSession, setExitSession] = useState<ParkingSession | null>(null);

  const load = () => {
    setLoading(true);
    sessionApi.getActive().then(setSessions).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">Operations</div>
        <h1 className="page-title">Live Sessions</h1>
        <p className="page-desc">Manage active parking sessions — entry and exit.</p>
      </div>

      <div className="page-body">
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={() => setShowEntry(true)}>
            <LogIn size={15} /> Vehicle Entry
          </button>
        </div>

        {/* Sessions table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Active Sessions</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {sessions.length > 0 && <div className="status-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />}
              <span className="badge badge-muted">{sessions.length} live</span>
            </div>
          </div>
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Owner</th>
                  <th>Type</th>
                  <th>Slot</th>
                  <th>Entry Time</th>
                  <th>Duration</th>
                  <th>Est. Fee</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr className="loading-row"><td colSpan={8}>LOADING SESSIONS...</td></tr>}
                {!loading && sessions.length === 0 && (
                  <tr><td colSpan={8}>
                    <div className="empty-state">
                      <Activity size={36} className="empty-icon" />
                      <div className="empty-title">No active sessions</div>
                      <div className="empty-desc">Use Vehicle Entry to park a new vehicle.</div>
                    </div>
                  </td></tr>
                )}
                {sessions.map(s => {
                  const mins = Math.round((Date.now() - new Date(s.entryTime).getTime()) / 60000);
                  const h = Math.floor(mins / 60), m = mins % 60;
                  const billableHours = Math.max(1, Math.ceil(mins / 60));
                  const fee = 5 + (billableHours - 1) * 2;
                  return (
                    <tr key={s.id}>
                      <td><span className="data-mono">{s.vehicle.registrationNo}</span></td>
                      <td>{s.vehicle.ownerName || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                      <td>
                        <span className={`badge ${s.vehicle.type === 'CAR' ? 'badge-cyan' : s.vehicle.type === 'MOTORCYCLE' ? 'badge-amber' : 'badge-orange'}`}>
                          {s.vehicle.type}
                        </span>
                      </td>
                      <td><span className="data-mono">{s.slot.slotNumber}</span></td>
                      <td><span className="data-mono">{new Date(s.entryTime).toLocaleTimeString()}</span></td>
                      <td><span className="data-mono" style={{ color: 'var(--amber)' }}>{h > 0 ? `${h}h ` : ''}{m}m</span></td>
                      <td><span className="data-mono" style={{ color: 'var(--green)' }}>${fee.toFixed(2)}</span></td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => setExitSession(s)}>
                          <LogOut size={12} /> Exit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showEntry && <EntryModal onClose={() => setShowEntry(false)} onSuccess={load} />}
      {exitSession && <ExitModal session={exitSession} onClose={() => setExitSession(null)} onSuccess={load} />}
    </>
  );
}
