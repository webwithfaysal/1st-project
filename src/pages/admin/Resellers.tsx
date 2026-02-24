import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

interface Reseller {
  id: number;
  name: string;
  email: string;
  balance: number;
}

export default function Resellers() {
  const [resellers, setResellers] = useState<Reseller[]>([]);

  const fetchResellers = () => {
    fetch('/api/admin/resellers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setResellers(data);
        }
      });
  };

  useEffect(() => {
    fetchResellers();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Resellers</h1>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {resellers.map((reseller) => (
            <li key={reseller.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Users className="h-6 w-6 text-indigo-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-indigo-600 truncate">{reseller.name}</p>
                      <p className="text-sm text-gray-500">{reseller.email}</p>
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Balance: ৳{reseller.balance.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
          {resellers.length === 0 && (
            <li className="px-4 py-8 text-center text-gray-500">
              No resellers found.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
