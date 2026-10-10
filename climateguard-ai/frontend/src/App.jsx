import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LocationProvider } from './context/LocationContext';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import ClimateAnalysis from './pages/ClimateAnalysis';
import RiskMap from './pages/RiskMap';
import RiskAnalysis from './pages/RiskAnalysis';
import ActionPlanner from './pages/ActionPlanner';
import CityComparison from './pages/CityComparison';
import About from './pages/About';

export default function App() {
  return (
    <LocationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="climate-analysis" element={<ClimateAnalysis />} />
            <Route path="risk-map" element={<RiskMap />} />
            <Route path="risk-analysis" element={<RiskAnalysis />} />
            <Route path="action-planner" element={<ActionPlanner />} />
            <Route path="comparison" element={<CityComparison />} />
            <Route path="about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LocationProvider>
  );
}
