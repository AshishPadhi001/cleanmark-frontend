import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function RootLayout() {
  const location = useLocation();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#24201c' }}>
      <Navbar />
      <main key={location.pathname} className="page-transition" style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
