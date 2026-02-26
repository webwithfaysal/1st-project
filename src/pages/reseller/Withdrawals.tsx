import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';

type Withdrawal = {
  id: number;
  amount: number;
  method: string;
  account_number: string;
  status: string;
  transaction_id?: string;
  created_at: string;
};

export default function Withdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ amount: 500, method: 'Bkash', account_number: '' });
  const [error, setError] = useState('');
  const { user, refreshUser } = useAuth();

  const fetchWithdrawals = () => {
    fetch(`/api/reseller/withdrawals?t=${new Date().getTime()}`)
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
    if (user?.id) {
      socket.emit('join', `reseller_${user.id}`);
    }
    
    socket.on('update_withdrawals', () => {
      fetchWithdrawals();
      refreshUser();
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.amount < 500) {
      setError('Minimum withdrawal amount is ৳500');
      return;
    }

    if (user && user.balance !== undefined && formData.amount > user.balance) {
      setError('Insufficient balance');
      return;
    }

    try {
      const res = await fetch('/api/reseller/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ amount: 500, method: 'Bkash', account_number: '' });
        fetchWithdrawals();
        refreshUser();
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Withdrawals</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Request Withdrawal
        </button>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Available Balance</p>
          <p className="text-2xl font-bold text-indigo-600">৳{user?.balance || 0}</p>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TrxID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {withdrawals.map((w) => (
              <tr key={w.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{w.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">৳{w.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{w.method}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{w.account_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{w.transaction_id || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    w.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    w.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {w.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(w.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Request Withdrawal
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount (Min ৳500)</label>
                      <input type="number" required min="500" max={user?.balance || 0} value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Method</label>
                      <select value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option value="Bkash">Bkash</option>
                        <option value="Nagad">Nagad</option>
                        <option value="Bank">Bank Transfer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Account Number</label>
                      <input type="text" required value={formData.account_number} onChange={e => setFormData({...formData, account_number: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                  </div>
                  {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
                    Submit Request
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
