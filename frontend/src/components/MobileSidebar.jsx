import { Link } from 'react-router-dom';
import { MdMenu, MdClose, MdDashboard, MdAttachMoney, MdFlag, MdAccountBalance, MdBarChart, MdPerson, MdCreditCard, MdLogout } from 'react-icons/md';

const MobileSidebar = ({ open, onClose }) => {
  return (
    <div className={`fixed inset-0 z-50 lg:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-black bg-opacity-40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <aside className={`absolute left-0 top-0 bottom-0 w-72 bg-white shadow-lg transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MdDashboard className="text-2xl text-primary-600" />
            <h3 className="text-lg font-bold">SmartFinance</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100"><MdClose /></button>
        </div>
        <nav className="p-4 space-y-2">
          <Link to="/" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50">
            <MdDashboard /> <span>Dashboard</span>
          </Link>
          <Link to="/transactions" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50">
            <MdAttachMoney /> <span>Transactions</span>
          </Link>
          <Link to="/budget" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50">
            <MdFlag /> <span>Budget</span>
          </Link>
          <Link to="/accounts" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50">
            <MdAccountBalance /> <span>Accounts</span>
          </Link>
          <Link to="/analytics" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50">
            <MdBarChart /> <span>Analytics</span>
          </Link>
          <Link to="/profile" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50">
            <MdPerson /> <span>Profile</span>
          </Link>
          <Link to="/debts" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50">
            <MdCreditCard /> <span>Debts</span>
          </Link>
          <button onClick={() => { onClose(); document.querySelector('button[aria-label="logout-btn"]').click?.(); }} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50">
            <MdLogout /> <span>Logout</span>
          </button>
        </nav>
      </aside>
    </div>
  );
};

export default MobileSidebar;
