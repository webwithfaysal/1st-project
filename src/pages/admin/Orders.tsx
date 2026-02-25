import { useState, useEffect } from 'react';

type Order = {
  id: number;
  reseller_name: string;
  product_name: string;
  admin_price: number;
  reseller_price: number;
  profit: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  status: string;
  created_at: string;
  delivery_charge: number;
  payment_method: string;
  location: string;
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = () => {
    fetch('/api/admin/orders')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data);
        }
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    await fetch(`/api/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Orders</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reseller</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prices</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.reseller_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.product_name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div>{order.customer_name}</div>
                  <div>{order.customer_phone}</div>
                  <div className="text-xs text-gray-400">{order.customer_address}</div>
                  <div className="text-xs text-indigo-500 mt-1">
                    {order.payment_method === 'advance' ? 'Advance' : 'COD'} - {order.location === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>Admin: ৳{order.admin_price}</div>
                  <div>Reseller: ৳{order.reseller_price}</div>
                  <div>Delivery: ৳{order.delivery_charge || 0}</div>
                  <div className="text-gray-900 font-bold">Total: ৳{order.reseller_price + (order.delivery_charge || 0)}</div>
                  <div className="text-green-600 font-medium mt-1">Profit: ৳{order.profit}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
