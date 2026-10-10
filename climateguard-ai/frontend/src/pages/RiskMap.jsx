import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLocation } from '../context/LocationContext';
import { api } from '../services/api';
import RiskScoreBadge from '../components/RiskScoreBadge';
import { LoadingSkeleton, ErrorMessage } from '../components/ErrorMessage';
import { MapPin, ArrowRight, ShieldCheck, AlertTriangle, ShieldAlert, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Create custom colored SVG marker icons for Leaflet
const createCustomIcon = (riskLevel) => {
  let color = '#10b981'; // Green / Low
  if (riskLevel === 'High') color = '#f43f5e'; // Red
  else if (riskLevel === 'Moderate') color = '#f59e0b'; // Amber

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <path fill="${color}" stroke="#0b1120" stroke-width="1.5" d="M12 0C7.58 0 4 3.58 4 8c0 5.25 7 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 6);
    }
  }, [center, map]);
  return null;
}

export default function RiskMap() {
  const { locations, selectedLocation, setSelectedLocation } = useLocation();
  const navigate = useNavigate();
  const [locationAssessments, setLocationAssessments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [focusedLocation, setFocusedLocation] = useState(null);

  useEffect(() => {
    async function loadAllAssessments() {
      try {
        setLoading(true);
        const mapData = {};
        // Fetch risk assessments for all locations
        await Promise.all(
          locations.map(async (loc) => {
            try {
              const res = await api.getRisk(loc.id);
              mapData[loc.id] = res;
            } catch (err) {
              console.warn(`Failed risk for ${loc.name}:`, err);
            }
          })
        );
        setLocationAssessments(mapData);
        if (selectedLocation) {
          setFocusedLocation(selectedLocation);
        }
      } catch (err) {
        setError('Failed to load geospatial climate indicators.');
      } finally {
        setLoading(false);
      }
    }

    if (locations.length > 0) {
      loadAllAssessments();
    }
  }, [locations, selectedLocation]);

  const mapCenter = focusedLocation
    ? [focusedLocation.latitude, focusedLocation.longitude]
    : [17.5, 79.5]; // Central South-East India default

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Interactive Climate Risk Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time geospatial distribution of compound climate risks across supported urban centers.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 text-xs">
          <span className="font-semibold text-slate-400">Risk Tiers:</span>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Low (&lt;30)</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Mod (30-59)</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>High (≥60)</span>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton height="h-[600px]" />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Leaflet Map Container */}
          <div className="lg:col-span-3 h-[580px] rounded-2xl overflow-hidden glass-panel border border-slate-800 relative z-0">
            <MapContainer
              center={mapCenter}
              zoom={6}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              <ChangeMapView center={mapCenter} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {locations.map((loc) => {
                const assessment = locationAssessments[loc.id];
                const riskLevel = assessment?.risk_level || 'Moderate';
                const score = assessment?.overall_score ?? '--';

                return (
                  <Marker
                    key={loc.id}
                    position={[loc.latitude, loc.longitude]}
                    icon={createCustomIcon(riskLevel)}
                    eventHandlers={{
                      click: () => {
                        setFocusedLocation(loc);
                      },
                    }}
                  >
                    <Popup>
                      <div className="p-1 space-y-2 text-slate-100 min-w-[180px]">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-white">{loc.name}</h4>
                          <span className="text-[11px] text-slate-400">{loc.state}</span>
                        </div>
                        <div className="pt-1 border-t border-slate-700/80">
                          <RiskScoreBadge score={score} level={riskLevel} size="sm" />
                        </div>
                        <div className="text-[11px] text-slate-300 space-y-1">
                          <div>Heat: <strong className="text-white">{assessment?.heat_score ?? '--'}</strong></div>
                          <div>Rainfall: <strong className="text-white">{assessment?.rainfall_score ?? '--'}</strong></div>
                          <div>Dry-Spell: <strong className="text-white">{assessment?.dry_spell_score ?? '--'}</strong></div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedLocation(loc);
                            navigate('/');
                          }}
                          className="w-full mt-2 py-1 px-2 text-center text-xs font-semibold rounded bg-teal-600 hover:bg-teal-500 text-white transition-colors flex items-center justify-center gap-1"
                        >
                          View Dashboard <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* Location Sidebar Details Card */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl glass-panel border border-slate-800">
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                Active Selection
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                {focusedLocation?.name || 'Select a City'}
              </h3>
              <p className="text-xs text-slate-400">
                {focusedLocation?.state}, India
              </p>

              {focusedLocation && locationAssessments[focusedLocation.id] && (
                <div className="mt-4 space-y-3">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Overall Score</span>
                    <RiskScoreBadge
                      score={locationAssessments[focusedLocation.id].overall_score}
                      level={locationAssessments[focusedLocation.id].risk_level}
                      size="sm"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Extreme Heat:</span>
                      <span className="font-mono font-bold text-amber-400">
                        {locationAssessments[focusedLocation.id].heat_score} / 100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Heavy Rainfall:</span>
                      <span className="font-mono font-bold text-sky-400">
                        {locationAssessments[focusedLocation.id].rainfall_score} / 100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dry-Spell Deficit:</span>
                      <span className="font-mono font-bold text-orange-400">
                        {locationAssessments[focusedLocation.id].dry_spell_score} / 100
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedLocation(focusedLocation);
                      navigate('/');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-bold border border-teal-500/40 transition-colors flex items-center justify-center gap-2"
                  >
                    Open Complete City Dashboard <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Quick Location Switcher List */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                All Monitored Cities ({locations.length})
              </span>
              <div className="mt-3 space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {locations.map((loc) => {
                  const assessment = locationAssessments[loc.id];
                  return (
                    <button
                      key={loc.id}
                      onClick={() => setFocusedLocation(loc)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors text-left ${
                        focusedLocation?.id === loc.id
                          ? 'bg-teal-500/15 border border-teal-500/30 text-teal-300 font-semibold'
                          : 'bg-slate-900/40 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span>{loc.name}</span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {assessment ? `${assessment.overall_score} pts` : '--'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
