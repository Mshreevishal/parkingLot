import { useEffect, useState } from 'react';
import { ParkingSquare, Car, CheckCircle2, Activity, TrendingUp } from 'lucide-react';
import { slotApi, sessionApi, vehicleApi } from '../services/api';
import type { ParkingSlot, ParkingSession, Vehicle } from '../types';

export default function Dashboard() {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [sessions, setSessions] = useState<ParkingSession[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([slotApi.getAll(), sessionApi.getActive(), vehicleApi.getAll()])
      .then(([s, sess, v]) => { setSlots(s); setSessions(sess); setVehicles(v); })
      .finally(() => setLoading(false));
  }, []);

  const available  = slots.filter(s => s.status === 'AVAILABLE').length;
  const occupied   = slots.filter(s => s.status === 'OCCUPIED').length;
  const maintenance = slots.filter(s => s.status === 'MAINTENANCE').length;

  if (loading) return (
    <div style={{ padding: '60px 36px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 11, letterSpacing: 1 }}>
      LOADING SYSTEM DATA...
    </div>
  );

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">Overview</div>
        <h1 className="page-title">Command Dashboard</h1>
        <p className="page-desc">Real-time overview of your parking facility.</p>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card amber">
            <div className="stat-label">Total Slots</div>
            <div className="stat-value">{slots.length}</div>
            <div className="stat-sub">Across all types</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Available</div>
            <div className="stat-value">{available}</div>
            <div className="stat-sub">Ready to park</div>
          </div>
          <div className="stat-card red">
            <div className="stat-label">Occupied</div>
            <div className="stat-value">{occupied}</div>
            <div className="stat-sub">Currently parked</div>
          </div>
          <div className="stat-card cyan">
            <div className="stat-label">Live Sessions</div>
            <div className="stat-value">{sessions.length}</div>
            <div className="stat-sub">Active right now</div>
          </div>
          <div className="stat-card amber">
            <div className="stat-label">Vehicles</div>
            <div className="stat-value">{vehicles.length}</div>
            <div className="stat-sub">Registered total</div>
          </div>
        </div>

        {/* Slot overview */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Slot Grid Overview</span>
            <span className="badge badge-muted">{slots.length} total</span>
          </div>
          <div style={{ padding: '20px 22px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {slots.length === 0 && (
              <div className="empty-state" style={{ padding: '30px', width: '100%' }}>
                <ParkingSquare size={32} className="empty-icon" />
                <span className="empty-title">No slots created yet</span>
              </div>
            )}
            {slots.map(slot => (
              <div
                key={slot.id}
                title={`${slot.slotNumber} · ${slot.type} · ${slot.status}`}
                style={{
                  width: 52, height: 52,
                  borderRadius: 6,
                  border: '1px solid',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  cursor: 'default',
                  transition: 'transform 0.1s',
                  borderColor: slot.status === 'AVAILABLE' ? 'rgba(74,222,128,0.3)' : slot.status === 'OCCUPIED' ? 'rgba(248,113,113,0.3)' : 'rgba(251,146,60,0.3)',
                  background: slot.status === 'AVAILABLE' ? 'var(--green-dim)' : slot.status === 'OCCUPIED' ? 'var(--red-dim)' : 'var(--orange-dim)',
                  color: slot.status === 'AVAILABLE' ? 'var(--green)' : slot.status === 'OCCUPIED' ? 'var(--red)' : 'var(--orange)',
                }}
              >
                <span style={{ fontWeight: 500 }}>{slot.slotNumber}</span>
                <span style={{ fontSize: 8, opacity: 0.7 }}>{slot.type.slice(0,3)}</span>
              </div>
            ))}
          </div>
          {slots.length > 0 && (
            <div style={{ padding: '12px 22px', borderTop: '1px solid var(--border-dim)', display: 'flex', gap: 20, fontSize: 11 }}>
              {[['Available', 'var(--green)', available], ['Occupied', 'var(--red)', occupied], ['Maintenance', 'var(--orange)', maintenance]].map(([label, color, count]) => (
                <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: color as string }} />
                  {label} · {count}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent sessions */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Live Parking Sessions</span>
            <Activity size={16} color="var(--text-muted)" />
          </div>
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Slot</th>
                  <th>Type</th>
                  <th>Entry Time</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                      NO ACTIVE SESSIONS
                    </td>
                  </tr>
                )}
                {sessions.map(s => {
                  const mins = Math.round((Date.now() - new Date(s.entryTime).getTime()) / 60000);
                  const h = Math.floor(mins / 60), m = mins % 60;
                  return (
                    <tr key={s.id}>
                      <td>
                        <div className="data-mono">{s.vehicle.registrationNo}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.vehicle.ownerName || '—'}</div>
                      </td>
                      <td><span className="data-mono">{s.slot.slotNumber}</span></td>
                      <td><span className={`badge badge-${s.vehicle.type === 'CAR' ? 'cyan' : s.vehicle.type === 'MOTORCYCLE' ? 'amber' : 'orange'}`}>{s.vehicle.type}</span></td>
                      <td><span className="data-mono">{new Date(s.entryTime).toLocaleTimeString()}</span></td>
                      <td><span className="data-mono" style={{ color: 'var(--amber)' }}>{h > 0 ? `${h}h ` : ''}{m}m</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
