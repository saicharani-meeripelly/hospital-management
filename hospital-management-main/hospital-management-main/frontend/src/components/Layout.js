import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
  '/': 'Dashboard',
  '/patients': 'Patients',
  '/doctors': 'Doctors',
  '/appointments': 'Appointments',
  '/admissions': 'Admissions',
  '/billing': 'Billing',
  '/departments': 'Departments',
};

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'HMS';

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
              <div className="breadcrumb">MediCore HMS / {title}</div>
            </div>
          </div>
          <div className="topbar-right">
            <div style={{ fontSize: 12, textAlign: 'right' }}>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{user?.name}</div>
              <div style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
