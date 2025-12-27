import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout';
import { Card, Button } from '../components/common';
import {
  Settings as SettingsIcon,
  Store,
  DollarSign,
  Printer,
  Database,
  Save,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import useAuthStore from '../store/authStore';
import settingsApi from '../api/settingsApi';

const Settings = () => {
  const toast = useToast();
  const { user } = useAuthStore();

  // Active tab
  const [activeTab, setActiveTab] = useState('store');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Store settings
  const [storeSettings, setStoreSettings] = useState({
    store_name: 'My POS Store',
    store_address: 'Jl. Example No. 123, Jakarta',
    store_phone: '021-12345678',
    store_email: 'store@example.com',
  });

  // Tax & pricing settings
  const [taxSettings, setTaxSettings] = useState({
    tax_enabled: true,
    tax_rate: 10,
    tax_label: 'PPN',
    currency: 'IDR',
    currency_symbol: 'Rp',
  });

  // Receipt settings
  const [receiptSettings, setReceiptSettings] = useState({
    show_logo: true,
    show_address: true,
    show_phone: true,
    footer_text: 'Terima kasih atas kunjungan Anda!',
  });

  // System settings
  const [systemSettings, setSystemSettings] = useState({
    auto_sync_enabled: true,
    sync_interval: 5,
    offline_mode_enabled: true,
    theme: 'light',
  });

  const tabs = [
    { id: 'store', label: 'Store Info', icon: Store },
    { id: 'tax', label: 'Tax & Pricing', icon: DollarSign },
    { id: 'receipt', label: 'Receipt', icon: Printer },
    { id: 'system', label: 'System', icon: Database },
  ];

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.getSettings();

      if (response.success && response.data) {
        const { store, tax, receipt, system } = response.data;

        // Update state with loaded settings
        if (store) setStoreSettings(store);
        if (tax) setTaxSettings(tax);
        if (receipt) setReceiptSettings(receipt);
        if (system) setSystemSettings(system);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);

      const settingsPayload = {
        store: storeSettings,
        tax: taxSettings,
        receipt: receiptSettings,
        system: systemSettings,
      };

      const response = await settingsApi.updateSettings(settingsPayload);

      if (response.success) {
        toast.success('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout title="Settings">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <SettingsIcon className="w-8 h-8" />
            Settings
          </h2>
          <p className="text-neutral-600 mt-1">
            Configure your POS system preferences
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="md" onClick={loadSettings} disabled={loading || saving}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="primary" size="md" onClick={handleSaveSettings} disabled={saving || user?.role !== 'admin'}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Admin only notice */}
      {user?.role !== 'admin' && (
        <Card className="mb-6 bg-warning-50 border-warning-200">
          <div className="p-4 text-warning-700">
            ⚠️ You need admin privileges to modify settings. Contact your administrator.
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <div className="p-2">
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg
                      transition-all duration-200
                      ${
                        activeTab === tab.id
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-neutral-600 hover:bg-neutral-50'
                      }
                    `}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <Card>
            <div className="p-6">
              {/* Store Info Tab */}
              {activeTab === 'store' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-4">
                      Store Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Store Name
                        </label>
                        <input
                          type="text"
                          value={storeSettings.store_name}
                          onChange={(e) =>
                            setStoreSettings({
                              ...storeSettings,
                              store_name: e.target.value,
                            })
                          }
                          disabled={user?.role !== 'admin'}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100"
                          placeholder="My Store"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Address
                        </label>
                        <textarea
                          value={storeSettings.store_address}
                          onChange={(e) =>
                            setStoreSettings({
                              ...storeSettings,
                              store_address: e.target.value,
                            })
                          }
                          disabled={user?.role !== 'admin'}
                          rows={3}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100"
                          placeholder="Store address..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Phone
                          </label>
                          <input
                            type="text"
                            value={storeSettings.store_phone}
                            onChange={(e) =>
                              setStoreSettings({
                                ...storeSettings,
                                store_phone: e.target.value,
                              })
                            }
                            disabled={user?.role !== 'admin'}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100"
                            placeholder="021-12345678"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={storeSettings.store_email}
                            onChange={(e) =>
                              setStoreSettings({
                                ...storeSettings,
                                store_email: e.target.value,
                              })
                            }
                            disabled={user?.role !== 'admin'}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100"
                            placeholder="store@example.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tax & Pricing Tab */}
              {activeTab === 'tax' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-4">
                      Tax & Pricing Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                        <div>
                          <p className="font-medium text-neutral-900">Enable Tax</p>
                          <p className="text-sm text-neutral-600">
                            Apply tax to transactions
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={taxSettings.tax_enabled}
                          onChange={(e) =>
                            setTaxSettings({
                              ...taxSettings,
                              tax_enabled: e.target.checked,
                            })
                          }
                          disabled={user?.role !== 'admin'}
                          className="w-12 h-6"
                        />
                      </div>

                      {taxSettings.tax_enabled && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                              Tax Label (e.g., VAT, PPN)
                            </label>
                            <input
                              type="text"
                              value={taxSettings.tax_label}
                              onChange={(e) =>
                                setTaxSettings({
                                  ...taxSettings,
                                  tax_label: e.target.value,
                                })
                              }
                              disabled={user?.role !== 'admin'}
                              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100"
                              placeholder="PPN"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                              Tax Rate (%)
                            </label>
                            <input
                              type="number"
                              value={taxSettings.tax_rate}
                              onChange={(e) =>
                                setTaxSettings({
                                  ...taxSettings,
                                  tax_rate: parseFloat(e.target.value) || 0,
                                })
                              }
                              disabled={user?.role !== 'admin'}
                              min="0"
                              max="100"
                              step="0.1"
                              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100"
                              placeholder="10"
                            />
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Currency
                        </label>
                        <select
                          value={taxSettings.currency}
                          onChange={(e) =>
                            setTaxSettings({
                              ...taxSettings,
                              currency: e.target.value,
                            })
                          }
                          disabled={user?.role !== 'admin'}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100"
                        >
                          <option value="IDR">Indonesian Rupiah (IDR)</option>
                          <option value="USD">US Dollar (USD)</option>
                          <option value="EUR">Euro (EUR)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Receipt Tab */}
              {activeTab === 'receipt' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-4">
                      Receipt Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                        <div>
                          <p className="font-medium text-neutral-900">Show Logo</p>
                          <p className="text-sm text-neutral-600">
                            Display store logo on receipt
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={receiptSettings.show_logo}
                          onChange={(e) =>
                            setReceiptSettings({
                              ...receiptSettings,
                              show_logo: e.target.checked,
                            })
                          }
                          disabled={user?.role !== 'admin'}
                          className="w-12 h-6"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                        <div>
                          <p className="font-medium text-neutral-900">Show Address</p>
                          <p className="text-sm text-neutral-600">
                            Display store address on receipt
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={receiptSettings.show_address}
                          onChange={(e) =>
                            setReceiptSettings({
                              ...receiptSettings,
                              show_address: e.target.checked,
                            })
                          }
                          disabled={user?.role !== 'admin'}
                          className="w-12 h-6"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                        <div>
                          <p className="font-medium text-neutral-900">Show Phone</p>
                          <p className="text-sm text-neutral-600">
                            Display phone number on receipt
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={receiptSettings.show_phone}
                          onChange={(e) =>
                            setReceiptSettings({
                              ...receiptSettings,
                              show_phone: e.target.checked,
                            })
                          }
                          disabled={user?.role !== 'admin'}
                          className="w-12 h-6"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Footer Text
                        </label>
                        <textarea
                          value={receiptSettings.footer_text}
                          onChange={(e) =>
                            setReceiptSettings({
                              ...receiptSettings,
                              footer_text: e.target.value,
                            })
                          }
                          disabled={user?.role !== 'admin'}
                          rows={3}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100"
                          placeholder="Thank you message..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* System Tab */}
              {activeTab === 'system' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-4">
                      System Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                        <div>
                          <p className="font-medium text-neutral-900">
                            Offline Mode
                          </p>
                          <p className="text-sm text-neutral-600">
                            Enable offline transaction support
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={systemSettings.offline_mode_enabled}
                          onChange={(e) =>
                            setSystemSettings({
                              ...systemSettings,
                              offline_mode_enabled: e.target.checked,
                            })
                          }
                          disabled={user?.role !== 'admin'}
                          className="w-12 h-6"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                        <div>
                          <p className="font-medium text-neutral-900">
                            Auto Sync
                          </p>
                          <p className="text-sm text-neutral-600">
                            Automatically sync data when online
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={systemSettings.auto_sync_enabled}
                          onChange={(e) =>
                            setSystemSettings({
                              ...systemSettings,
                              auto_sync_enabled: e.target.checked,
                            })
                          }
                          disabled={user?.role !== 'admin'}
                          className="w-12 h-6"
                        />
                      </div>

                      {systemSettings.auto_sync_enabled && (
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Sync Interval (minutes)
                          </label>
                          <input
                            type="number"
                            value={systemSettings.sync_interval}
                            onChange={(e) =>
                              setSystemSettings({
                                ...systemSettings,
                                sync_interval: parseInt(e.target.value) || 5,
                              })
                            }
                            disabled={user?.role !== 'admin'}
                            min="1"
                            max="60"
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Theme
                        </label>
                        <select
                          value={systemSettings.theme}
                          onChange={(e) =>
                            setSystemSettings({
                              ...systemSettings,
                              theme: e.target.value,
                            })
                          }
                          disabled={user?.role !== 'admin'}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark (Coming Soon)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
