import React from 'react';
import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import LandingPage from './pages/LandingPage';
import ImageStudioPage from './pages/ImageStudioPage';
import VideoStudioPage from './pages/VideoStudioPage';
import SupportPage from './pages/SupportPage';

const router = createHashRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true,             element: <LandingPage /> },
      { path: 'studio/image',    element: <ImageStudioPage /> },
      { path: 'studio/video',    element: <VideoStudioPage /> },
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
