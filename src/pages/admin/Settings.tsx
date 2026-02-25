import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Settings() {
  const { t } = useTranslation();
  const [bonusType, setBonusType] = useState('fixed');
  const [bonusAmount, setBonusAmount] = useState('50');
  const [deliveryAdvanceInside, setDeliveryAdvanceInside] = useState('60');
  const [deliveryAdvanceOutside, setDeliveryAdvanceOutside] = useState('120');
  const [deliveryCodInside, setDeliveryCodInside] = useState('80');
  const [deliveryCodOutside, setDeliveryCodOutside] = useState('150');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.referral_bonus_type) setBonusType(data.referral_bonus_type);
        if (data.referral_bonus_amount) setBonusAmount(data.referral_bonus_amount);
        if (data.delivery_charge_advance_inside) setDeliveryAdvanceInside(data.delivery_charge_advance_inside);
        if (data.delivery_charge_advance_outside) setDeliveryAdvanceOutside(data.delivery_charge_advance_outside);
        if (data.delivery_charge_cod_inside) setDeliveryCodInside(data.delivery_charge_cod_inside);
        if (data.delivery_charge_cod_outside) setDeliveryCodOutside(data.delivery_charge_cod_outside);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referral_bonus_type: bonusType,
        referral_bonus_amount: bonusAmount,
        delivery_charge_advance_inside: deliveryAdvanceInside,
        delivery_charge_advance_outside: deliveryAdvanceOutside,
        delivery_charge_cod_inside: deliveryCodInside,
        delivery_charge_cod_outside: deliveryCodOutside
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
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('delivery_settings')}</h2>
            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('delivery_advance_inside')}</label>
                <input
                  type="number"
                  value={deliveryAdvanceInside}
                  onChange={(e) => setDeliveryAdvanceInside(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('delivery_advance_outside')}</label>
                <input
                  type="number"
                  value={deliveryAdvanceOutside}
                  onChange={(e) => setDeliveryAdvanceOutside(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('delivery_cod_inside')}</label>
                <input
                  type="number"
                  value={deliveryCodInside}
                  onChange={(e) => setDeliveryCodInside(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('delivery_cod_outside')}</label>
                <input
                  type="number"
                  value={deliveryCodOutside}
                  onChange={(e) => setDeliveryCodOutside(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
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
