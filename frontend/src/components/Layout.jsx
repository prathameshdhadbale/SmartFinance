import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdMenu, MdDashboard, MdAttachMoney, MdAccountBalance, MdCreditCard, MdBarChart, MdFlag } from 'react-icons/md';
import MobileBottomNav from './MobileBottomNav';
import MobileSidebar from './MobileSidebar';
import { useState } from 'react';

const Layout = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: MdDashboard },
    { path: '/transactions', label: 'Transactions', icon: MdAttachMoney },
    { path: '/accounts', label: 'Accounts', icon: MdAccountBalance },
    { path: '/debts', label: 'Debts', icon: MdCreditCard },
    { path: '/analytics', label: 'Analytics', icon: MdBarChart },
    { path: '/budget', label: 'Budget', icon: MdFlag },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button aria-label="open-menu" onClick={() => setSidebarOpen(true)} className="p-2 rounded-md hover:bg-gray-100">
              <MdMenu className="text-2xl" />
            </button>
            <h1 className="text-xl font-bold text-primary-600">SmartFinance</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 truncate max-w-[120px]">{user?.name}</span>
            <button aria-label="logout-btn" onClick={logout} className="text-sm text-red-600 hover:text-red-700">Logout</button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:bg-white lg:border-r lg:border-gray-200 lg:min-h-screen">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-primary-600">SmartFinance</h1>
            <p className="text-sm text-gray-500 mt-1">Personal Finance Tracker</p>
          </div>
          <nav className="flex-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="text-xl" aria-hidden />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </aside>

        <MobileBottomNav />

        <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 pb-24 lg:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
