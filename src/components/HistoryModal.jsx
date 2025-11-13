// src/components/HistoryModal.jsx
import React from 'react';
import { FiX, FiClock, FiExternalLink } from 'react-icons/fi';
import { getBackendUrl } from '../utils/pricing';

const formatDate = (isoOrDate) => {
  try {
    const d = new Date(isoOrDate);
    return d.toLocaleString();
  } catch (e) {
    return String(isoOrDate);
  }
};

const HistoryModal = ({ onClose }) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [transactions, setTransactions] = React.useState([]);
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    let mounted = true;
    async function fetchHistory() {
      setLoading(true);
      setError(null);
      try {
        const backend = getBackendUrl();
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const res = await fetch(`${backend}/api/revenue?month=${month}&year=${year}`);
        if (!res.ok) throw new Error('Failed to load history');
        const data = await res.json();
        if (!mounted) return;
        setTransactions(data.transactions || []);
        setTotal(data.total || 0);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || 'Failed to load history');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchHistory();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center space-x-3">
            <FiClock className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Lịch sử giao dịch</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FiX className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[75vh]">
          {loading && <p className="text-gray-600">Đang tải...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && !error && (
            <>
              <div className="mb-4 text-gray-800">
                Tổng tháng này: <span className="font-semibold text-blue-600">{Number(total).toFixed(6)} ETH</span>
              </div>

              {transactions.length === 0 ? (
                <p className="text-gray-600">Chưa có giao dịch nào trong tháng này.</p>
              ) : (
                <div className="space-y-4">
                  {transactions.map((tx, idx) => (
                    <div key={idx} className="border rounded-xl p-4 hover:shadow-md transition">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="text-sm text-gray-600">{formatDate(tx.date)}</div>
                        <div className="text-sm text-gray-600 break-all">{tx.customer}</div>
                        <div className="text-sm font-semibold text-green-600">{tx.price_eth} ETH</div>
                      </div>
                      {Array.isArray(tx.medicine) ? (
                        <div className="mt-2 text-sm text-gray-800">
                          {tx.medicine.map((m, i) => (
                            <div key={i} className="flex justify-between">
                              <span className="truncate mr-2">{m.name} x {m.qty}</span>
                              <span className="text-gray-600">${m.price_usd}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-2 text-sm text-gray-800">{tx.medicine}</div>
                      )}

                      {tx.tx_hash && (
                        <div className="mt-2 text-xs text-gray-600 flex items-center space-x-2">
                          <span className="font-mono">{tx.tx_hash.slice(0, 16)}...</span>
                          <a
                            href={`https://sepolia.etherscan.io/tx/${tx.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FiExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;


