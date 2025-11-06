import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface IpRecord {
  id: number;
  ip: string;
  label?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminPanel: React.FC = () => {
  const [ips, setIps] = useState<IpRecord[]>([]);
  const [newIp, setNewIp] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchIps();
  }, []);

  const fetchIps = async () => {
    try {
      const response = await api.get('/ip-allowlist');
      setIps(response.data);
    } catch (err) {
      console.error('Error fetching IPs:', err);
    }
  };

  const handleAddIp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/ip-allowlist', { ip: newIp, label: newLabel });
      setNewIp('');
      setNewLabel('');
      setSuccess('IP added successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchIps();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to add IP');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveIp = async (ip: string) => {
    if (!window.confirm(`Are you sure you want to deactivate ${ip}?`)) return;

    try {
      await api.delete(`/ip-allowlist/${ip}`);
      setSuccess('IP deactivated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchIps();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to remove IP');
    }
  };

  const handleActivateIp = async (ip: string) => {
    try {
      await api.post(`/ip-allowlist/${ip}/activate`);
      setSuccess('IP activated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchIps();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to activate IP');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-pink-700 px-6 py-5">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-3xl">🛡️</span>
          <span>Admin Panel</span>
        </h2>
        <p className="text-purple-100 text-sm mt-1">
          IP Allow-List Management
        </p>
      </div>

      <div className="p-6">
        {/* Add IP Form */}
        <form onSubmit={handleAddIp} className="mb-6 p-4 bg-purple-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Add New IP</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IP Address
              </label>
              <input
                type="text"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                placeholder="127.0.0.1 or ::1"
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label (optional)
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Office, VPN, etc."
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !newIp}
            className="mt-3 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add IP'}
          </button>
        </form>

        {/* Feedback Messages */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <span>✓</span>
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <span>⚠</span>
            {error}
          </div>
        )}

        {/* IP List */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Allowed IPs ({ips.length})</h3>
          {ips.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🔒</div>
              <p>No IPs in allow-list</p>
              <p className="text-sm text-gray-400 mt-1">Add an IP above to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {ips.map((record) => (
                <div
                  key={record.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                    record.isActive
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-300 opacity-60'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-semibold ${
                        record.isActive ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {record.ip}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        record.isActive
                          ? 'bg-green-200 text-green-800'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {record.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {record.label && (
                      <p className="text-sm text-gray-600 mt-1">{record.label}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Added {new Date(record.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {record.isActive ? (
                      <button
                        onClick={() => handleRemoveIp(record.ip)}
                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-lg transition-colors duration-200"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivateIp(record.ip)}
                        className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium rounded-lg transition-colors duration-200"
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

