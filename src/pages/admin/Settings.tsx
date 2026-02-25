import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Settings() {
  const { t } = useTranslation();
  const [bonusType, setBonusType] = useState('fixed');
  const [bonusAmount, setBonusAmount] = useState('50');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.referral_bonus_type) setBonusType(data.referral_bonus_type);
        if (data.referral_bonus_amount) setBonusAmount(data.referral_bonus_amount);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referral_bonus_type: bonusType,
        referral_bonus_amount: bonusAmount
      })
    });
    if (res.ok) {
      setMessage(t('settings_saved'));
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">{t('settings')}</h1>
      <div className="bg-white shadow sm:rounded-lg p-6 max-w-2xl">
        <h2 className="text-lg font-medium text-gray-900 mb-4">{t('affiliate_settings')}</h2>
        {message && <div className="mb-4 text-green-600 text-sm">{message}</div>}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('referral_bonus_type')}</label>
            <select
              value={bonusType}
              onChange={(e) => setBonusType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="fixed">{t('fixed_amount')}</option>
              <option value="percentage">{t('percentage_amount')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('referral_bonus_amount')}</label>
            <input
              type="number"
              value={bonusAmount}
              onChange={(e) => setBonusAmount(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {t('save_settings')}
          </button>
        </form>
      </div>
    </div>
  );
}
