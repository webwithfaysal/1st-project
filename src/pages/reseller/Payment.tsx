import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';

export default function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [formData, setFormData] = useState({
    method: 'bKash',
    phone: '',
    trx_id: '',
    payer_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reseller/orders/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setOrder(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load order details');
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`/api/reseller/orders/${id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        navigate('/reseller/orders');
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (err) {
      setError('Network error');
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error && !order) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  const totalToPay = order.admin_price + (order.delivery_charge || 0);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Complete Advance Payment</h1>
      
      <div className="bg-white shadow sm:rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-5 sm:px-6 bg-indigo-50 border-b border-indigo-100">
          <h3 className="text-lg leading-6 font-medium text-indigo-900">Order Summary (#{order.id})</h3>
          <p className="mt-1 max-w-2xl text-sm text-indigo-700">Please review the amount to pay.</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Product</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.product_name}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Admin Price</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">৳{order.admin_price}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Delivery Charge</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">৳{order.delivery_charge || 0}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
              <dt className="text-sm font-bold text-gray-900">Total to Pay</dt>
              <dd className="mt-1 text-sm font-bold text-indigo-600 sm:mt-0 sm:col-span-2">৳{totalToPay}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <CreditCard className="mr-2 h-5 w-5 text-gray-400" />
          Payment Details
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
            <select
              value={formData.method}
              onChange={(e) => setFormData({...formData, method: e.target.value})}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="bKash">bKash</option>
              <option value="Nagad">Nagad</option>
              <option value="Rocket">Rocket</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Sender Phone Number</label>
            <input
              type="text"
              required
              placeholder="e.g. 017XXXXXXXX"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
            <input
              type="text"
              required
              placeholder="e.g. 8N7A6B5C4D"
              value={formData.trx_id}
              onChange={(e) => setFormData({...formData, trx_id: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Payer Name</label>
            <input
              type="text"
              required
              placeholder="Name of the sender"
              value={formData.payer_name}
              onChange={(e) => setFormData({...formData, payer_name: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/reseller/orders')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
            >
              Skip for now
            </button>
            <button
              type="submit"
              className="bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
