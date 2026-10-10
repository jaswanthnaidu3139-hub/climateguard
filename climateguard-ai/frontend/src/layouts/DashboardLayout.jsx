import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  LineChart,
  Map,
  ShieldAlert,
  CalendarCheck,
  Scale,
  Info,
  Menu,
  X,
  MapPin,
  Clock,
  Shield,
  Activity,
  ChevronDown
} from 'lucide-react';
import { useLocation } from '../context/LocationContext';

const NAV_ITEMS = [
  { path: '/', label: 'Overview Dashboard', icon: LayoutDashboard },
  { path: '/climate-analysis', label: 'Climate Analysis', icon: LineChart },
  { path: '/risk-map', label: 'Interactive Risk Map', icon: Map },
  { path: '/risk-analysis', label: 'Risk & What-If Sim', icon: ShieldAlert },
  { path: '/action-planner', label: 'Action Planner', icon: CalendarCheck },
  { path: '/comparison', label: 'City Comparison', icon: Scale },
  { path: '/about', label: 'Methodology & About', icon: Info },
];

export default function DashboardLayout() {
  const { locations, selectedLocation, setSelectedLocation } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLocationChange = (e) => {
    const locId = e.target.value;
    const found = locations.find((l) => l.id === locId);
    if (found) setSelectedLocation(found);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0f1d] text-slate-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-[#0d1527] border-r border-slate-800/80 transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-0 max-lg:-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 shadow-lg shadow-teal-500/10">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                ClimateGuard <span className="text-xs px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30">AI</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Risk Intelligence Platform</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 font-semibold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#090e1a]/80 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            <span>Open-Meteo Verified Feeds</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Decision support tool for communities. Not official disaster warnings.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="flex items-center justify-between h-16 px-4 sm:px-6 bg-[#0d1527]/90 border-b border-slate-800 backdrop-blur z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-white lg:hidden hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Location selector dropdown */}
            <div className="flex items-center gap-2 bg-[#121c33] border border-slate-700/80 rounded-lg px-3 py-1.5 shadow-sm">
              <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
              <select
                id="location-selector"
                value={selectedLocation?.id || ''}
                onChange={handleLocationChange}
                className="text-xs sm:text-sm font-medium text-white bg-transparent border-none focus:outline-none cursor-pointer pr-2"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">
                    {loc.name}, {loc.state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Real-time status badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 text-xs rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Live System Ready</span>
            </div>

            {/* Last updated timestamp indicator */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Observation:</span>
              <span className="text-slate-300 font-mono">Live</span>
            </div>
          </div>
        </header>

        {/* Page View Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
