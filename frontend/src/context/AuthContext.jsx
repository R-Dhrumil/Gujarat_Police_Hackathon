import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : {
      id: 1,
      username: 'admin',
      full_name: 'State Super Administrator',
      role: 'SUPER_ADMIN',
      department_name: 'Gujarat State Command Center'
    };
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || 'demo_token');
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await authApi.login(username, password);
      const { access_token, user: userData } = response.data;
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.warn('Backend login failed, fallback to demo user if credentials match:', error);
      // Fallback demo credentials check
      const demoUsers = {
        admin: { id: 1, username: 'admin', full_name: 'State Super Administrator', role: 'SUPER_ADMIN', department_name: 'Gujarat State Command Center' },
        police_admin: { id: 2, username: 'police_admin', full_name: 'DSP Traffic & Law Command', role: 'DEPARTMENT_ADMIN', department_name: 'Home Department (Gujarat Police)' },
        rto_admin: { id: 3, username: 'rto_admin', full_name: 'RTO Commissionerate Admin', role: 'DEPARTMENT_ADMIN', department_name: 'Ports and Transport (RTO)' },
        operator: { id: 4, username: 'operator', full_name: 'Command Center Duty Officer', role: 'OPERATOR', department_name: 'Amdavad Municipal Corporation (AMC)' },
        viewer: { id: 5, username: 'viewer', full_name: 'Departmental Read-Only Auditor', role: 'VIEWER', department_name: 'Public Works' }
      };

      if (demoUsers[username] && (password === 'password123' || password === 'admin')) {
        const demoUser = demoUsers[username];
        setUser(demoUser);
        setToken('demo_token');
        localStorage.setItem('token', 'demo_token');
        localStorage.setItem('user', JSON.stringify(demoUser));
        return { success: true };
      }

      return {
        success: false,
        error: error.response?.data?.detail || 'Invalid username or password'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Quick switch role for hackathon demonstrations
  const switchDemoRole = (roleKey) => {
    const roles = {
      SUPER_ADMIN: { id: 1, username: 'admin', full_name: 'State Super Administrator', role: 'SUPER_ADMIN', department_name: 'All Departments' },
      POLICE_ADMIN: { id: 2, username: 'police_admin', full_name: 'DSP Traffic & Law Command', role: 'DEPARTMENT_ADMIN', department_name: 'Home Department (Gujarat Police)' },
      RTO_ADMIN: { id: 3, username: 'rto_admin', full_name: 'RTO Commissionerate Admin', role: 'DEPARTMENT_ADMIN', department_name: 'Ports and Transport (RTO)' },
      OPERATOR: { id: 4, username: 'operator', full_name: 'Command Center Duty Officer', role: 'OPERATOR', department_name: 'Amdavad Municipal Corporation (AMC)' },
      VIEWER: { id: 5, username: 'viewer', full_name: 'Read-Only Auditor', role: 'VIEWER', department_name: 'Audit Division' }
    };
    if (roles[roleKey]) {
      setUser(roles[roleKey]);
      localStorage.setItem('user', JSON.stringify(roles[roleKey]));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, switchDemoRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
