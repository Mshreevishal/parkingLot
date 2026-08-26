import React, { useState, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, ParkingSquare, Activity, X, CheckCircle, AlertCircle, Info } from 'lucide-react';

// ── Toast context ──────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info';
interface Toast { id: number; type: ToastType; message: string; }

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

export const ToastContext = React.createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return React.useContext(ToastContext);
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: '/',        label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/vehicles', label: 'Vehicles',    icon: Car },
  { to: '/slots',    label: 'Parking Slots', icon: ParkingSquare },
  { to: '/sessions', label: 'Live Sessions', icon: Activity },
];

function Sidebar() {
  const location = useLocation();
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <div className="logo-icon">PC</div>
          <div>
            <div className="logo-text">ParkCommand</div>
            <div className="logo-sub">Management System</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={16} className="nav-icon" />
              {label}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-status">
          <div className="status-dot" />
          <span className="status-label">System Online</span>
        </div>
      </div>
    </aside>
  );
}

// ── Toast manager ──────────────────────────────────────────────────────────────
function ToastIcon({ type }: { type: ToastType }) {
  if (type === 'success') return <CheckCircle size={16} color="var(--green)" />;
  if (type === 'error')   return <AlertCircle size={16} color="var(--red)" />;
  return <Info size={16} color="var(--cyan)" />;
}

// ── Layout shell ───────────────────────────────────────────────────────────────
export default function Layout({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let nextId = React.useRef(0);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++nextId.current;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      <div className="app-shell app-grid-bg">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>

      {/* Toast container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <ToastIcon type={t.type} />
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
