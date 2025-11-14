import React, { useContext, useState } from 'react';
import { AppContext } from './App';
import AdminHeader from './components/layout/AdminHeader';
import { User, UserRole } from './types';
import { AdminDashboardView } from './views/AdminDashboard';
import UserManagementView from './views/UserManagementView';
import { useTranslation } from './contexts/LanguageContext';
import AdminBottomNavBar from './components/layout/AdminBottomNavBar';
import AdminSettingsView from './views/AdminSettingsView';
import PendingRequestsView from './views/PendingRequestsView';
import CopyTradingManagementView from './views/CopyTradingManagementView';
import ProfitControlView from './views/ProfitControlView';

const AdminDashboardPage: React.FC = () => {
  const context = useContext(AppContext);
  const [activeView, setActiveView] = useState('dashboard');
  // FIX: Add state for search and filter to be passed down to child components.
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { t } = useTranslation();
  
  if (!context || !context.data) return null;
  const { user: adminUser } = context;

  if (!adminUser || (adminUser.role !== UserRole.ADMIN && adminUser.role !== UserRole.OWNER)) {
    return <div className="p-8 text-red-500 dark:text-red-400 font-semibold text-center">{t('accessDenied') || 'Access Denied.'}</div>;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <AdminDashboardView />;
      case 'users':
        // FIX: Pass required props to UserManagementView.
        return <UserManagementView searchTerm={searchTerm} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />;
      case 'requests':
        return <PendingRequestsView />;
      case 'copy-trading':
        return <CopyTradingManagementView />;
      case 'profit-control':
        return <ProfitControlView />;
      case 'settings':
        return <AdminSettingsView />;
      default:
        return <AdminDashboardView />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      {/* FIX: Pass required props to AdminHeader. */}
      <AdminHeader adminUser={adminUser} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24">
        {renderView()}
      </main>
      <AdminBottomNavBar activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
};

export default AdminDashboardPage;