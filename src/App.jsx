import React from 'react';
import { createBrowserRouter, createHashRouter, RouterProvider, Navigate } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import LandingPage from './pages/LandingPage';
import VideoStudioPage from './pages/VideoStudioPage';
import SupportPage from './pages/SupportPage';

// Use clean HTML5 browser router (zero hashtags) for web & Vercel, fallback to hash for Electron file://
const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:';
const createRouter = isFileProtocol ? createHashRouter : createBrowserRouter;

const router = createRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true,             element: <LandingPage /> },
      { path: 'studio/video',    element: <VideoStudioPage /> },
      // Redirect all legacy image studio routes directly to Video Studio
      { path: 'studio/image',    element: <Navigate to="/studio/video" replace /> },
      { path: 'image-studio',    element: <Navigate to="/studio/video" replace /> },
      { path: 'image',           element: <Navigate to="/studio/video" replace /> },
      { path: 'studio',          element: <Navigate to="/studio/video" replace /> },
      { path: 'support',         element: <SupportPage /> },
      { path: 'donate',          element: <SupportPage /> },
      { path: 'buy-me-a-coffee', element: <SupportPage /> },
      { path: '*',               element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
