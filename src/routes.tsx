import type { ReactNode } from 'react';
import HomePage from './pages/HomePage';
import DonorPage from './pages/DonorPage';
import ChatPage from './pages/ChatPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import MapPage from './pages/MapPage';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  { name: 'Home',     path: '/',         element: <HomePage />,     public: true },
  { name: 'Donor',    path: '/donor',    element: <DonorPage />,    public: true },
  { name: 'Map',      path: '/map',      element: <MapPage />,      public: true },
  { name: 'Chat',     path: '/chat',     element: <ChatPage />,     public: true },
  { name: 'Register', path: '/register', element: <RegisterPage />, public: true },
  { name: 'Profile',  path: '/profile',  element: <ProfilePage />,  public: true },
];
