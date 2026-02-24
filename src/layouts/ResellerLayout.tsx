import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, CreditCard, LogOut, MessageSquare } from 'lucide-react';
import { clsx } from 'clsx';

export default function ResellerLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/reseller', icon: LayoutDashboard },
    { name: 'Products', href: '/reseller/products', icon: Package },
    { name: 'My Orders', href: '/reseller/orders', icon: ShoppingCart },
    { name: 'Withdrawals', href: '/reseller/withdrawals', icon: CreditCard },
    { name: 'Messages', href: '/reseller/messages', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-900 text-white flex flex-col">
        <div className="h-16 flex items-center px-6 font-bold text-xl border-b border-indigo-800">
          Reseller Panel
        </div>
        <div className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  isActive ? 'bg-indigo-800 text-white' : 'text-indigo-300 hover:bg-indigo-800 hover:text-white',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                )}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-indigo-800">
          <div className="flex items-center mb-4 px-2">
            <div className="text-sm font-medium text-indigo-300">{user?.name}</div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center px-2 py-2 text-sm font-medium text-indigo-300 rounded-md hover:bg-indigo-800 hover:text-white"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-100 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
