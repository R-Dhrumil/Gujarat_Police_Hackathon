import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import { Layout } from './components/layout/Layout';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Registry } from './pages/Registry';
import { GISMapPage } from './pages/GISMapPage';
import { GapAnalysis } from './pages/GapAnalysis';
import { LiveViewer } from './pages/LiveViewer';
import { VideoWall } from './pages/VideoWall';
import { ANPRPage } from './pages/ANPRPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { AlertsPage } from './pages/AlertsPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { VMSSystemsPage } from './pages/VMSSystemsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';

export default function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Main Application Shell */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              
              {/* Model 1 Routes */}
              <Route path="registry" element={<Registry />} />
              <Route path="gis-map" element={<GISMapPage />} />
              <Route path="gap-analysis" element={<GapAnalysis />} />
              <Route path="departments" element={<DepartmentsPage />} />

              {/* Model 2 Routes */}
              <Route path="live-viewer" element={<LiveViewer />} />
              <Route path="video-wall" element={<VideoWall />} />
              <Route path="anpr" element={<ANPRPage />} />
              <Route path="watchlist" element={<WatchlistPage />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="vms-systems" element={<VMSSystemsPage />} />

              {/* System Admin Routes */}
              <Route path="audit-logs" element={<AuditLogPage />} />
              <Route path="settings" element={<SettingsPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AlertProvider>
    </AuthProvider>
  );
}
