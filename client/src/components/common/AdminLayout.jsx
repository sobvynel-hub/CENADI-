import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-white dark:bg-dark-bg overflow-hidden">
      <AdminSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-6 bg-white dark:bg-dark-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
}