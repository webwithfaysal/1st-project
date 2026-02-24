import { useEffect, useState } from 'react';
import { DollarSign, Users, ShoppingBag, CreditCard } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProfit: 0,
    totalResellers: 0,
    pendingWithdrawals: 0,
  });

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setStats(data);
        }
      });
  }, []);

  const statCards = [
    { name: 'Total Sales', value: `৳${stats.totalSales}`, icon: DollarSign, color: 'bg-emerald-500' },
    { name: 'Total Profit', value: `৳${stats.totalProfit}`, icon: ShoppingBag, color: 'bg-blue-500' },
    { name: 'Total Resellers', value: stats.totalResellers, icon: Users, color: 'bg-purple-500' },
    { name: 'Pending Withdrawals', value: stats.pendingWithdrawals, icon: CreditCard, color: 'bg-amber-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`rounded-md p-3 ${item.color}`}>
                    <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{item.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
