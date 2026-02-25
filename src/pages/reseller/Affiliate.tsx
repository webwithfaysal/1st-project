import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Affiliate() {
  const { t } = useTranslation();
  const [data, setData] = useState({
    referral_code: '',
    total_earnings: 0,
    referred_users: [] as any[]
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/reseller/affiliate')
      .then(res => res.json())
      .then(resData => {
        if (!resData.error) {
          setData(resData);
        }
      });
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">{t('affiliate_program')}</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="rounded-md p-3 bg-indigo-500">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">{t('total_referrals')}</dt>
                <dd className="text-2xl font-semibold text-gray-900">{data.referred_users.length}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="rounded-md p-3 bg-emerald-500">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">{t('total_earnings')}</dt>
                <dd className="text-2xl font-semibold text-gray-900">৳{data.total_earnings}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">{t('your_referral_code')}</h2>
        <div className="flex items-center space-x-4">
          <div className="bg-gray-100 px-4 py-2 rounded-md text-lg font-mono font-bold tracking-wider">
            {data.referral_code || 'Loading...'}
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Copy className="h-4 w-4 mr-2" />
            {copied ? t('copied') : t('copy_code')}
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">{t('share_code_desc')}</p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{t('referred_users')}</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {data.referred_users.map((user) => (
            <li key={user.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-indigo-600 truncate">{user.name}</p>
                <div className="ml-2 flex-shrink-0 flex">
                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {t('registered')}
                  </p>
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-gray-500">
                    {user.email}
                  </p>
                </div>
              </div>
            </li>
          ))}
          {data.referred_users.length === 0 && (
            <li className="px-4 py-8 text-center text-gray-500">
              {t('no_referrals_yet')}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
