import { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, CreditCard } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProfit: 0,
    balance: 0,
  });

  useEffect(() => {
    fetch('/api/reseller/dashboard')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setStats(data);
        }
      });
  }, []);

  const statCards = [
    { name: 'Total Sales', value: `৳${stats.totalSales}`, icon: DollarSign, color: 'bg-indigo-500' },
    { name: 'Total Profit', value: `৳${stats.totalProfit}`, icon: ShoppingBag, color: 'bg-emerald-500' },
    { name: 'Available Balance', value: `৳${stats.balance}`, icon: CreditCard, color: 'bg-blue-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
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
      
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">How it works</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>Browse products and set your own selling price.</li>
          <li>Place orders with your customer's details.</li>
          <li>We will ship the product directly to your customer.</li>
          <li>Once the order is marked as <strong>Delivered</strong>, your profit (Your Price - Admin Price) will be added to your balance.</li>
          <li>You can request a withdrawal once your balance reaches ৳500.</li>
        </ul>
      </div>
    </div>
  );
}
