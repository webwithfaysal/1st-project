import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, Users, ShoppingCart, CreditCard, LogOut, MessageSquare, Settings, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  const navigation = [
    { name: t('dashboard'), href: '/admin', icon: LayoutDashboard },
    { name: t('products'), href: '/admin/products', icon: Package },
    { name: t('resellers'), href: '/admin/resellers', icon: Users },
    { name: t('orders'), href: '/admin/orders', icon: ShoppingCart },
    { name: t('withdrawals'), href: '/admin/withdrawals', icon: CreditCard },
    { name: 'Transactions', href: '/admin/transactions', icon: FileText },
    { name: t('messages'), href: '/admin/messages', icon: MessageSquare },
    { name: t('settings'), href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="h-16 flex items-center px-6 font-bold text-xl border-b border-slate-800">
          Admin Panel
        </div>
        <div className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                )}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center mb-4 px-2">
            <div className="text-sm font-medium text-slate-300">{user?.name}</div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center px-2 py-2 text-sm font-medium text-slate-300 rounded-md hover:bg-slate-800 hover:text-white"
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
            {navigation.find((item) => item.href === location.pathname)?.name || t('admin_panel')}
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
