import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

type Withdrawal = {
  id: number;
  reseller_name: string;
  amount: number;
  method: string;
  account_number: string;
  status: string;
  created_at: string;
};

export default function Withdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  const fetchWithdrawals = () => {
    fetch('/api/admin/withdrawals')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setWithdrawals(data);
        }
      });
  };

  useEffect(() => {
    fetchWithdrawals();

    const socket = io();
    socket.emit('join', 'admin');
    
    socket.on('update_withdrawals', () => {
      fetchWithdrawals();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    if (confirm(`Are you sure you want to mark this withdrawal as ${status}?`)) {
      const res = await fetch(`/api/admin/withdrawals/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchWithdrawals();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Withdrawal Requests</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reseller</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {withdrawals.map((w) => (
              <tr key={w.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{w.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{w.reseller_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">৳{w.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{w.method}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{w.account_number}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    w.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    w.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {w.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {w.status === 'Pending' && (
                    <div className="flex space-x-2">
                      <button onClick={() => handleStatusChange(w.id, 'Approved')} className="text-green-600 hover:text-green-900">Approve</button>
                      <button onClick={() => handleStatusChange(w.id, 'Rejected')} className="text-red-600 hover:text-red-900">Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
