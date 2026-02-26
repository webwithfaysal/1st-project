import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

type Transaction = {
  id: number;
  transaction_id: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
};

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetch(`/api/reseller/transactions?t=${new Date().getTime()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setTransactions(data);
        }
      });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Transactions</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TrxID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((t) => (
              <tr key={t.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{t.transaction_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{t.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">৳{t.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(t.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
