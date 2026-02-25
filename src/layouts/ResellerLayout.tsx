import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, CreditCard, LogOut, MessageSquare, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useEffect } from 'react';
import { io } from 'socket.io-client';

export default function ResellerLayout() {
  const { logout, user, refreshUser } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  const navigation = [
    { name: t('dashboard'), href: '/reseller', icon: LayoutDashboard },
    { name: t('products'), href: '/reseller/products', icon: Package },
    { name: t('my_orders'), href: '/reseller/orders', icon: ShoppingCart },
    { name: t('withdrawals'), href: '/reseller/withdrawals', icon: CreditCard },
    { name: t('messages'), href: '/reseller/messages', icon: MessageSquare },
    { name: t('affiliate'), href: '/reseller/affiliate', icon: Users },
  ];

  useEffect(() => {
    const socket = io();
    if (user?.id) {
      socket.emit('join', `reseller_${user.id}`);
    }
    
    socket.on('update_dashboard', () => {
      refreshUser();
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id, refreshUser]);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-900 text-white flex flex-col">
        <div className="h-16 flex items-center px-6 font-bold text-xl border-b border-indigo-800">
          Reseller Panel
        </div>
        <div className="flex-1 px-4 py-6 flex flex-col">
          <div className="space-y-2 flex-1">
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
          
          {/* Stable Round Section */}
          <div className="mt-auto pt-8">
            <div className="bg-indigo-800/50 rounded-3xl p-5 text-center border border-indigo-700/50 backdrop-blur-sm">
              <div className="w-16 h-16 mx-auto bg-indigo-600 rounded-full flex items-center justify-center mb-3 shadow-lg ring-4 ring-indigo-900">
                <CreditCard className="w-7 h-7 text-indigo-100" />
              </div>
              <p className="text-indigo-300 text-xs font-medium uppercase tracking-wider mb-1">Available Balance</p>
              <p className="text-white text-2xl font-bold tracking-tight">৳{user?.balance || 0}</p>
            </div>
          </div>
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
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            {navigation.find((item) => item.href === location.pathname)?.name || t('reseller_panel')}
          </h1>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <span className="text-sm text-gray-500">{user?.name}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-100 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
