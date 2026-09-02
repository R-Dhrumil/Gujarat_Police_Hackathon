import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { alertApi } from '../services/alertApi';

const AlertContext = createContext(null);

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [unacknowledgedCount, setUnacknowledgedCount] = useState(0);
  const [latestToastAlert, setLatestToastAlert] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Fetch initial alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const response = await alertApi.getAlerts({ limit: 30 });
      setAlerts(response.data);
      const unack = response.data.filter(a => !a.is_acknowledged).length;
      setUnacknowledgedCount(unack);
    } catch (e) {
      console.warn('Could not fetch alerts from backend:', e);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 20000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  // Connect to WebSocket for Real-time Alert Broadcasts
  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;

    const connectWs = () => {
      const wsUrl = `ws://localhost:8000/ws/alerts`;
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setWsConnected(true);
          console.log('[WEBSOCKET] Connected to real-time alert feed');
        };

        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === 'NEW_ALERT') {
              const newAlert = payload.data;
              setAlerts(prev => [newAlert, ...prev]);
              setUnacknowledgedCount(c => c + 1);
              setLatestToastAlert(newAlert);
              // Auto dismiss toast after 8 seconds
              setTimeout(() => setLatestToastAlert(null), 8000);
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimeout = setTimeout(connectWs, 5000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (err) {
        console.warn('WebSocket connect error, retrying in 5s:', err);
        reconnectTimeout = setTimeout(connectWs, 5000);
      }
    };

    connectWs();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  const acknowledgeAlert = async (id, notes = 'Acknowledged by operator') => {
    try {
      const res = await alertApi.acknowledgeAlert(id, notes);
      setAlerts(prev => prev.map(a => a.id === id ? res.data : a));
      setUnacknowledgedCount(prev => Math.max(0, prev - 1));
      return { success: true };
    } catch (e) {
      // Local optimistic update
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_acknowledged: true, status: 'ACKNOWLEDGED' } : a));
      setUnacknowledgedCount(prev => Math.max(0, prev - 1));
      return { success: true };
    }
  };

  const triggerTestAlert = async (camera_id = 1, plate = 'GJ01TEST999', severity = 'HIGH') => {
    try {
      const res = await alertApi.triggerTestAlert({ camera_id, plate, severity });
      setAlerts(prev => [res.data, ...prev]);
      setUnacknowledgedCount(c => c + 1);
      setLatestToastAlert(res.data);
      setTimeout(() => setLatestToastAlert(null), 8000);
      return res.data;
    } catch (e) {
      console.error('Test alert trigger failed:', e);
    }
  };

  return (
    <AlertContext.Provider value={{
      alerts,
      unacknowledgedCount,
      latestToastAlert,
      dismissToast: () => setLatestToastAlert(null),
      acknowledgeAlert,
      triggerTestAlert,
      wsConnected,
      refreshAlerts: fetchAlerts
    }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => useContext(AlertContext);
