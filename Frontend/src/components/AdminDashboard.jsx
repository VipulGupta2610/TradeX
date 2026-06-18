import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';

// ─── Helper Functions ────────────────────────────────────────────────────────
const formatDate = (isoString) => {
  if (!isoString) return 'Recently'; 
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

function polylineFromData(data, width, height, padding = 8) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  return data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');
}

function areaFromData(data, width, height, padding = 8) {
  const pts = polylineFromData(data, width, height, padding);
  return `M0,${height} L${pts.split(' ').map(p => p).join(' L')} L${width},${height} Z`;
}

// ─── Mock Data for Static Sections ──────────────────────────────────────────────
const yourSites = [
  { name: 'UI KIT', url: 'www.uikit.to', visits: 189452201 },
  { name: 'UI Design', url: 'www.uidesign.ro', visits: 906400025 },
  { name: 'Bexon', url: 'www.bexon.agency', visits: 152824001 },
];

const nodes = [
  { name: 'US-East (Trade Engine)', load: 45, status: 'Healthy', color: '#10b981' },
  { name: 'EU-Central (WebSockets)', load: 82, status: 'High Load', color: '#f59e0b' },
  { name: 'AP-South (Database)', load: 32, status: 'Healthy', color: '#10b981' },
];

const navItems = [
  { label: 'Dashboard', icon: GridIcon },
  { label: 'Analytics', icon: BarIcon },
  { label: 'Sites', icon: SitesIcon },
  { label: 'Explore Domain', icon: DomainIcon },
  { label: 'Website Builder', icon: BuilderIcon },
  { label: 'Manage Service', icon: ServiceIcon },
  { label: 'Monitoring', icon: MonitorIcon },
  { label: 'Bugs & Issues', icon: BugIcon },
  { label: 'Activity Log', icon: LogIcon },
];

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function GridIcon({ size = 16, color = 'currentColor' }) { return (<svg width={size} height={size} fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5" fill={color} /><rect x="14" y="3" width="7" height="7" rx="1.5" fill={color} /><rect x="3" y="14" width="7" height="7" rx="1.5" fill={color} /><rect x="14" y="14" width="7" height="7" rx="1.5" fill={color} /></svg>); }
function BarIcon({ size = 16, color = 'currentColor' }) { return (<svg width={size} height={size} fill="none" viewBox="0 0 24 24"><rect x="3" y="12" width="4" height="9" rx="1" fill={color} /><rect x="10" y="7" width="4" height="14" rx="1" fill={color} /><rect x="17" y="3" width="4" height="18" rx="1" fill={color} /></svg>); }
function SitesIcon({ size = 16, color = 'currentColor' }) { return (<svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}><circle cx="12" cy="12" r="9" /><path d="M12 3C12 3 8 7 8 12s4 9 4 9M12 3c0 0 4 4 4 9s-4 9-4 9M3 12h18" /></svg>); }
function DomainIcon({ size = 16, color = 'currentColor' }) { return (<svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}><circle cx="11" cy="11" r="7" /><path d="M16.5 16.5L21 21" strokeLinecap="round" /></svg>); }
function BuilderIcon({ size = 16, color = 'currentColor' }) { return (<svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}><rect x="3" y="3" width="18" height="14" rx="2" /><path d="M3 8h18M8 21h8M12 17v4" strokeLinecap="round" /></svg>); }
function ServiceIcon({ size = 16, color = 'currentColor' }) { return (<svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>); }
function MonitorIcon({ size = 16, color = 'currentColor' }) { return (<svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" /></svg>); }
function BugIcon({ size = 16, color = 'currentColor' }) { return (<svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 20v-2m-5.3-15.3l-1.4-1.4m13.4 1.4l1.4-1.4M4 12h2m14 0h2m-4.3 5.3l1.4 1.4M6.7 17.3l-1.4 1.4M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19 10a7 7 0 00-14 0v4a7 7 0 0014 0v-4z" /></svg>); }
function LogIcon({ size = 16, color = 'currentColor' }) { return (<svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}><path d="M9 12h6M9 16h4M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2" strokeLinecap="round" /><rect x="7" y="2" width="10" height="4" rx="1" /></svg>); }
function BellIcon() { return (<svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" /></svg>); }
function SearchIcon() { return (<svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="11" cy="11" r="7" /><path d="M16.5 16.5L21 21" strokeLinecap="round" /></svg>); }

// ─── Chart Components ────────────────────────────────────────────────────────
function AreaChart({ data, width = 400, height = 160, color = '#6366f1' }) {
  const pts = polylineFromData(data, width, height);
  const area = areaFromData(data, width, height);
  const max = Math.max(...data);
  const hiIdx = data.indexOf(max);
  const hiX = (hiIdx / (data.length - 1)) * width;
  const minV = Math.min(...data), maxV = max, range = maxV - minV || 1;
  const hiY = height - 8 - ((max - minV) / range) * (height - 16);
  const gradId = `ag${color.replace('#', '')}`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ transition: 'all 0.3s ease' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} style={{ transition: 'd 0.5s ease' }} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" style={{ transition: 'points 0.5s ease' }} />
      <line x1={hiX} y1={0} x2={hiX} y2={height} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" style={{ transition: 'all 0.5s ease' }} />
      <circle cx={hiX} cy={hiY} r="4" fill={color} style={{ transition: 'all 0.5s ease' }} />
      <rect x={hiX - 36} y={hiY - 30} width={72} height={22} rx="5" fill="#1e2235" style={{ transition: 'all 0.5s ease' }} />
      <text x={hiX} y={hiY - 14} textAnchor="middle" fill="white" fontSize="10" fontWeight="600" style={{ transition: 'all 0.5s ease' }}>{(max / 10).toFixed(1)} GB</text>
      <text x={hiX} y={hiY - 3} textAnchor="middle" fill="#10b981" fontSize="9" style={{ transition: 'all 0.5s ease' }}>Live Data</text>
    </svg>
  );
}

function LineChart({ data, width = 260, height = 100, color = '#fff' }) {
  const pts = polylineFromData(data, width, height);
  const area = areaFromData(data, width, height);
  const gradId = `lg${Math.random().toString(36).slice(2, 6)}`;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} style={{ transition: 'd 0.5s ease' }} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" style={{ transition: 'points 0.5s ease' }} />
    </svg>
  );
}

function BarChart({ data, width = 260, height = 100, color = '#f59e0b', highlightColor = '#fff' }) {
  const max = Math.max(...data) || 1; // Fallback to 1 to prevent division by zero
  const barW = (width / data.length) * 0.55;
  const gap = width / data.length;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {data.map((v, i) => {
        const bh = Math.max((v / max) * (height - 8), 2); // Minimum 2px height so 0 isn't invisible
        const x = i * gap + (gap - barW) / 2;
        const isHi = i === data.length - 1; 
        return (
          <rect
            key={i}
            x={x} y={height - bh - 2}
            width={barW} height={bh}
            rx="2"
            fill={isHi ? highlightColor : color}
            opacity={isHi ? 1 : 0.7}
            style={{ transition: 'all 0.5s ease' }}
          />
        );
      })}
    </svg>
  );
}

function DonutChart({ used, total, color = '#6366f1', size = 100, stroke = 14 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const frac = used / total;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${Math.max(0, frac) * circ} ${circ}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.5s ease' }}
      />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="#10b981" strokeWidth={stroke}
        strokeDasharray={`${Math.max(0, frac) * circ * 0.18} ${circ}`}
        strokeDashoffset={circ * 0.25 - Math.max(0, frac) * circ * 0.82}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease, stroke-dasharray 0.5s ease' }}
      />
    </svg>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [bugReports, setBugReports] = useState([]); 
  const [apiData, setApiData] = useState({
    totalUsers: 0,
    totalOrders: 0,
    todayOrdersCount: 0,
    todayOrders: []
  });

  const [chartData, setChartData] = useState({
    cdn: [18, 25, 22, 35, 30, 45, 76, 55, 48, 60, 52, 58, 50, 65, 55, 70, 62, 58, 72, 68, 60, 75, 65, 70, 65, 72, 68, 75],
    ordersVolume: [12, 18, 14, 22, 19, 28, 24, 30, 26, 20, 32, 28, 36, 31, 27, 38, 33, 29, 42, 36, 31, 45, 39, 34, 48, 42, 37, 50], // Mapped to Orders
    dailyBugsMock: [3, 5, 2, 7, 4, 6, 3, 8, 5, 2, 4, 6, 3], // 13 days of mock data (14th will be today's live data)
    resourceUsage: 72
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, bugsRes] = await Promise.all([
          api.get('/admin/AdminDashboard'),
          api.get('/admin/AdminDashboard/bugs')
        ]);

        if (dashboardRes.data) setApiData(dashboardRes.data);
        if (bugsRes.data) setBugReports(bugsRes.data);
        
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => {
        const nextCdn = Math.max(20, Math.min(100, prev.cdn[prev.cdn.length - 1] + (Math.random() * 14 - 7)));
        const nextOrderVol = Math.max(10, Math.min(80, prev.ordersVolume[prev.ordersVolume.length - 1] + (Math.random() * 10 - 5)));
        const nextResource = Math.max(40, Math.min(95, prev.resourceUsage + (Math.random() * 6 - 3)));

        return {
          ...prev, // Keep the dailyBugsMock static since it's daily data
          cdn: [...prev.cdn.slice(1), nextCdn],
          ordersVolume: [...prev.ordersVolume.slice(1), nextOrderVol],
          resourceUsage: nextResource
        };
      });
    }, 2500); 
    return () => clearInterval(interval);
  }, []);

  const handledeletebug = async (bugId) => {
    try {
      await api.delete(`/admin/AdminDashboard/deletebug/${bugId}`);
      toast.success("Bug resolved");

      // Instantly remove the deleted bug from the UI without refreshing
      setBugReports((prevBugs) => prevBugs.filter((b) => b._id !== bugId));
    } catch (error) {
      console.error("Failed to delete bug:", error);
    }
  };

  const dynamicKpis = [
    { label: 'Total Users', value: apiData.totalUsers.toLocaleString(), trend: 'Active Accounts', up: true },
    { label: 'Total Orders', value: apiData.totalOrders.toLocaleString(), trend: 'Lifetime Volume', up: true },
    { label: 'Orders Today', value: apiData.todayOrdersCount.toLocaleString(), trend: '24h Volume', up: true },
    { label: 'System Health', value: '99.9%', trend: 'Stable', up: null },
  ];

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#111827',
      color: '#e5e7eb',
      fontFamily: "'Inter', 'SF Pro Display', sans-serif",
      overflow: 'hidden',
    }}>
      
      {/* ── GLOBAL STYLE INJECTION TO HIDE SCROLLBARS ── */}
      <style>
        {`
          ::-webkit-scrollbar {
            display: none;
          }
          * {
            -ms-overflow-style: none;  
            scrollbar-width: none;  
          }
        `}
      </style>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 200,
        background: '#0f1623',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        zIndex: 10,
      }}>
        <Toaster/>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'linear-gradient(135deg,#6366f1,#818cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, color: 'white',
            }}>W4</div>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'white', letterSpacing: 0.3 }}>Web4</span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {navItems.map(({ label, icon: Icon }) => {
            const active = activeNav === label;
            return (
              <button
                key={label}
                onClick={() => setActiveNav(label)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 8, border: 'none',
                  background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: active ? '#818cf8' : '#6b7280',
                  fontSize: 13, fontWeight: active ? 600 : 500,
                  cursor: 'pointer', marginBottom: 2,
                  transition: 'all 0.15s',
                  textAlign: 'left',
                  borderLeft: active ? '2px solid #6366f1' : '2px solid transparent',
                }}
              >
                <Icon size={15} color={active ? '#818cf8' : '#6b7280'} />
                {label}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '12px 12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg,#6366f1,#10b981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, color: 'white', flexShrink: 0,
            }}>A</div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'white', margin: 0, lineHeight: 1.3 }}>Superadmin</p>
              <p style={{ fontSize: 10, color: '#4b5563', margin: 0, fontFamily: 'monospace' }}>ID: 0000-1</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: '#0f1623', flexShrink: 0,
        }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'white', margin: 0 }}>Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 4 }}>
              <SearchIcon />
            </button>
            <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 4 }}>
              <BellIcon />
            </button>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg,#6366f1,#10b981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, color: 'white', cursor: 'pointer',
            }}>A</div>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── TOP ROW: CDN Chart + Your Sites ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16 }}>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Live Bandwidth</p>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
                  </div>
                  <p style={{ fontSize: 11, color: '#374151', margin: 0 }}>Streaming</p>
                </div>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>{(chartData.cdn[chartData.cdn.length - 1] / 10).toFixed(2)} GB/s</span>
              </div>
              <div style={{ display: 'flex', gap: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: 18, paddingRight: 8, fontSize: 10, color: '#374151', textAlign: 'right', minWidth: 34 }}>
                  {['10GB', '7.5GB', '5GB', '2.5GB', '0GB'].map(l => <span key={l}>{l}</span>)}
                </div>
                <div style={{ flex: 1 }}>
                  <AreaChart data={chartData.cdn} width={520} height={140} color="#6366f1" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#374151', marginTop: 4 }}>
                    {['-60s', '-45s', '-30s', '-15s', 'Now'].map(l => <span key={l}>{l}</span>)}
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Your Sites</span>
                <span style={{ fontSize: 11, color: '#6366f1', cursor: 'pointer' }}>View all</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Name</span>
                <span style={{ fontSize: 10, color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Visit</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {yourSites.map((site) => (
                  <div key={site.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'white', margin: 0 }}>{site.name}</p>
                      <p style={{ fontSize: 11, color: '#4b5563', margin: 0 }}>{site.url}</p>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', fontVariantNumeric: 'tabular-nums' }}>
                      {site.visits.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ── MIDDLE ROW: Orders Today + Daily Bugs + Resource Usage ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 260px', gap: 16 }}>
            
            {/* UPDATED: Orders Today Line Chart */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <p style={{ fontSize: 12, color: '#909cad', margin: 0 }}>Orders Today</p>
                  <p style={{ fontSize: 11, color: '#909cad', margin: 0 }}>Processing Volume</p>
                </div>
                {/* Dynamically pulls the live todayOrdersCount */}
                <span style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>{apiData.todayOrdersCount.toLocaleString()}</span>
              </div>
              {/* Added a green #10b981 color to represent successful orders */}
              <LineChart data={chartData.ordersVolume.slice(-14)} width={260} height={88} color="#10b981" />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#909cad', marginTop: 4 }}>
                {['-30s', '-25s', '-20s', '-15s', '-10s', '-5s', 'Now'].map(l => <span key={l}>{l}</span>)}
              </div>
            </Card>

            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <p style={{ fontSize: 12, color: '#909cad', margin: 0 }}>Bug Reports</p>
                  <p style={{ fontSize: 11, color: '#909cad', margin: 0 }}>Daily Frequency</p>
                </div>
                <span style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{bugReports.length}</span>
              </div>
              <BarChart 
                data={[...chartData.dailyBugsMock, bugReports.length]} 
                width={260} 
                height={88} 
                color="#4b5563" 
                highlightColor="#ef4444" 
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#909cad', marginTop: 4 }}>
                {['-14d', '-12d', '-10d', '-8d', '-6d', '-4d', 'Today'].map(l => <span key={l}>{l}</span>)}
              </div>
            </Card>

            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Server Load</span>
                <span style={{ fontSize: 11, color: '#4b5563' }}>Real-time</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                <DonutChart used={chartData.resourceUsage} total={100} color="#6366f1" size={96} stroke={13} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: 'CPU Usage', val: `${chartData.resourceUsage.toFixed(1)}%`, color: '#6366f1' },
                  { label: 'Memory', val: `${(chartData.resourceUsage / 15).toFixed(1)} GB / 8 GB`, color: '#10b981' },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{
                    background: 'rgba(255,255,255,0.04)', borderRadius: 8,
                    padding: '8px 10px', borderLeft: `2px solid ${color}`,
                  }}>
                    <p style={{ fontSize: 10, color: '#4b5563', margin: 0, fontWeight: 600 }}>{label}</p>
                    <p style={{ fontSize: 10, color: '#9ca3af', margin: 0, marginTop: 2, lineHeight: 1.3 }}>{val}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ── KPI & NODE ROW ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {dynamicKpis.map((kpi, i) => (
              <Card key={i} style={{ padding: '14px 16px' }}>
                <p style={{ fontSize: 10, color: '#4b5563', margin: 0, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{kpi.label}</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: 'white', margin: '6px 0 4px', fontVariantNumeric: 'tabular-nums' }}>{kpi.value}</p>
                <p style={{ fontSize: 11, color: kpi.up === true ? '#10b981' : kpi.up === false ? '#f87171' : '#6b7280', margin: 0 }}>{kpi.trend}</p>
              </Card>
            ))}
          </div>

          <Card style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Node Infrastructure</span>
              <button style={{ fontSize: 11, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#9ca3af', padding: '4px 12px', cursor: 'pointer' }}>Manage Fleet</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {nodes.map((n, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#d1d5db' }}>{n.name}</span>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#6b7280' }}>{n.load}%</span>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${n.load}%` }}
                      transition={{ duration: 1 }}
                      style={{ height: '100%', borderRadius: 99, background: n.color }}
                    />
                  </div>
                  <p style={{ fontSize: 10, color: '#4b5563', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: 1 }}>{n.status}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* ── BOTTOM ROW: Today's Orders & Bugs Report ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            {/* Today's Orders */}
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Today's Orders</span>
                <span style={{ fontSize: 11, color: '#6b7280', cursor: 'pointer' }}>View All Orders →</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500, fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                      {['Order ID', 'User ID', 'Symbol', 'Name', 'Exchange'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, color: '#4b5563', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {apiData.todayOrders.length > 0 ? (
                        apiData.todayOrders.map((order, idx) => (
                          <motion.tr
                            key={order._id}
                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * idx }}
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 11, color: '#d1d5db' }}>{order._id}</td>
                            <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 11, color: '#9ca3af' }}>{order.userid}</td>
                            <td style={{ padding: '12px 16px', fontWeight: 700, color: 'white' }}>{order.symbol}</td>
                            <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{order.name}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{
                                display: 'inline-block', padding: '3px 8px', borderRadius: 5,
                                fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
                                background: 'rgba(99,102,241,0.1)',
                                color: '#818cf8',
                                border: '1px solid rgba(99,102,241,0.2)',
                              }}>{order.exchange}</span>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
                            No orders processed today yet.
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </Card>

            {/* LIVE DATA SECTION: Bugs Report */}
            <Card style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Active Bug Reports</span>
                <span style={{ fontSize: 11, color: '#6b7280', cursor: 'pointer' }}>View All</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <AnimatePresence>
                  {bugReports.length > 0 ? (
                    bugReports.map((bug) => (
                      <motion.div 
                        key={bug._id} 
                        initial={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0, overflow: 'hidden', padding: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#e5e7eb', fontFamily: 'monospace' }}>
                            {bug._id.slice(-6).toUpperCase()}
                          </span>
                          <span style={{
                            fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, padding: '2px 6px', borderRadius: 4,
                            background: bug.severity === 'Critical' ? 'rgba(239,68,68,0.15)' : bug.severity === 'High' ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)',
                            color: bug.severity === 'Critical' ? '#fca5a5' : bug.severity === 'High' ? '#fcd34d' : '#93c5fd'
                          }}>
                            {bug.severity || 'Medium'}
                          </span>
                        </div>
                        <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, lineHeight: 1.4 }}>
                          <strong style={{ color: '#d1d5db' }}>{bug.title}</strong>: {bug.description}
                        </p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                          <span style={{ fontSize: 10, color: '#6b7280' }}>
                             {bug.category} • {formatDate(bug.createdAt)}
                          </span>
                          <button 
                            onClick={() => handledeletebug(bug._id)} 
                            style={{ 
                              fontSize: 10, 
                              color: '#10b981', 
                              background: 'transparent', 
                              border: '1px solid rgba(16, 185, 129, 0.3)', 
                              padding: '2px 8px', 
                              borderRadius: '4px',
                              cursor: 'pointer' 
                            }}>
                            Resolve
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', padding: '10px 0' }}>No active bugs reported.</p>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}

// ─── Reusable Card ─────────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: '#0f1623',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14,
      padding: '16px 18px',
      ...style,
    }}>
      {children}
    </div>
  );
}