import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { Video, Shield, MapPin, Eye, ExternalLink, Activity } from 'lucide-react';

// Custom colored SVG pin factory
const createCustomMarkerIcon = (color = '#3b82f6', isLive = true) => {
  const pulseHtml = isLive
    ? `<span style="position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background: #10b981; border-radius: 50%; border: 1px solid #070a13;"></span>`
    : '';

  const svgHtml = `
    <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
      <svg viewBox="0 0 24 24" width="28" height="28" fill="${color}" stroke="#ffffff" stroke-width="1.2" style="filter: drop-shadow(0 2px 5px rgba(0,0,0,0.6));">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
      ${pulseHtml}
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-gis-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });
};

// Map View Controller Helper
const SetMapView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const GISMapComponent = ({
  cameras = [],
  selectedCamera = null,
  onSelectCamera = null,
  showCoverageRadius = true,
  height = 'h-[600px]',
  center = [23.2156, 72.6369], // Gujarat center
  zoom = 8
}) => {
  const navigate = useNavigate();

  return (
    <div className={`relative w-full ${height} rounded-2xl overflow-hidden border border-slate-800 shadow-2xl z-0`}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%', backgroundColor: '#070a13' }}
        attributionControl={false}
      >
        <SetMapView center={center} zoom={zoom} />

        {/* CartoDB Dark Matter Tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {/* Render Camera Markers & Coverage Zones */}
        {cameras.map((cam) => {
          const isLive = cam.status === 'Active';
          const deptColor = cam.department_color || '#3b82f6';
          const icon = createCustomMarkerIcon(deptColor, isLive);

          return (
            <React.Fragment key={cam.id}>
              {/* Coverage radius overlay */}
              {showCoverageRadius && (
                <Circle
                  center={[cam.latitude, cam.longitude]}
                  radius={cam.coverage_radius_meters || 80}
                  pathOptions={{
                    color: deptColor,
                    fillColor: deptColor,
                    fillOpacity: 0.12,
                    weight: 1,
                    dashArray: '4, 4'
                  }}
                />
              )}

              {/* Camera Pin Marker */}
              <Marker
                position={[cam.latitude, cam.longitude]}
                icon={icon}
                eventHandlers={{
                  click: () => {
                    if (onSelectCamera) onSelectCamera(cam);
                  }
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-3 max-w-[260px] text-slate-100">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-blue-400">
                        {cam.camera_code}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isLive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {cam.status}
                      </span>
                    </div>

                    <h4 className="font-semibold text-sm text-white line-clamp-1">{cam.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{cam.landmark_address || `${cam.city}, ${cam.district}`}</p>

                    <div className="mt-2.5 pt-2 border-t border-slate-800 grid grid-cols-2 gap-1.5 text-[11px] text-slate-300">
                      <div>
                        <span className="text-slate-500 block">Department:</span>
                        <span className="font-medium truncate block">{cam.department_name || 'Police'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Camera Type:</span>
                        <span className="font-medium block">{cam.camera_type || 'IP'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Coordinates:</span>
                        <span className="font-mono text-[10px] block">{cam.latitude.toFixed(4)}, {cam.longitude.toFixed(4)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Coverage:</span>
                        <span className="font-medium block">{cam.coverage_radius_meters || 75}m</span>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => navigate(`/live-viewer?camera=${cam.id}`)}
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Live Stream
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Floating Map Legend */}
      <div className="absolute bottom-4 left-4 z-10 glass-panel p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5 shadow-xl hidden md:block">
        <p className="font-bold text-white text-[11px] uppercase tracking-wider mb-1">Gujarat GIS Layers</p>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span>Police (Home Dept)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
          <span>Municipal (AMC / SMC)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
          <span>RTO / Transport</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Active Feed / Stream</span>
        </div>
      </div>
    </div>
  );
};
