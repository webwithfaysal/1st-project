import { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, CreditCard, Clock } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    totalProfit: 0,
    balance: 0,
    totalWithdrawn: 0,
    recentOrders: [] as any[],
  });

  useEffect(() => {
    const fetchStats = () => {
      fetch('/api/reseller/dashboard', { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setStats(data);
          }
        });
    };

    fetchStats();

    const socket = io();
    if (user?.id) {
      socket.emit('join', `reseller_${user.id}`);
    }
    
    socket.on('update_dashboard', () => {
      fetchStats();
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id]);

  const statCards = [
    { name: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-indigo-500' },
    { name: 'Total Sales', value: `৳${stats.totalSales}`, icon: DollarSign, color: 'bg-emerald-500' },
    { name: 'Total Profit', value: `৳${stats.totalProfit}`, icon: ShoppingBag, color: 'bg-blue-500' },
    { name: 'Available Balance', value: `৳${stats.balance}`, icon: CreditCard, color: 'bg-purple-500' },
    { name: 'Total Withdrawn', value: `৳${stats.totalWithdrawn}`, icon: Clock, color: 'bg-orange-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
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

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentOrders && stats.recentOrders.map((order: any) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.product_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!stats.recentOrders || stats.recentOrders.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No recent orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
