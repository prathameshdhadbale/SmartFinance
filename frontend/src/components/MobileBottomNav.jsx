import { Link, useLocation } from 'react-router-dom';
import { MdDashboard, MdAttachMoney, MdFlag } from 'react-icons/md';

const MobileBottomNav = () => {
  const location = useLocation();

  const tabs = [
    { to: '/', label: 'Dashboard', icon: MdDashboard },
    { to: '/transactions', label: 'Transactions', icon: MdAttachMoney },
    { to: '/budget', label: 'Budget', icon: MdFlag },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = location.pathname === tab.to;
          return (
            <Link key={tab.to} to={tab.to} className={`flex flex-col items-center gap-1 px-3 py-1 ${active ? 'text-primary-600' : 'text-gray-600'}`}>
              <Icon className="text-2xl" aria-hidden />
              <span className="text-[10px]">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
