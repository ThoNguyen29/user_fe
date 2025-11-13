import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { getBackendUrl } from '../utils/pricing';

function UserProfile() {
  const { user, token, logout } = useAuth();
  const { account } = useWeb3();
  const [txs, setTxs] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const res = await fetch(`${getBackendUrl()}/api/revenue?month=${month}&year=${year}`);
        const data = await res.json();
        setTxs(data.transactions || []);
        setTotal(data.total || 0);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  if (!token) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-2">Vui lòng đăng nhập</h2>
        <p className="text-gray-600">Bạn cần đăng nhập để xem thông tin người dùng và lịch sử giao dịch.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sidebar right-aligned in navbar, but content here */}
      <div className="lg:col-span-1 space-y-4">
        <div className="border rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Thông tin tài khoản</h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-500 block mb-1">ID (Địa chỉ ví):</span>
              <span className="font-mono text-xs break-all bg-gray-50 p-2 rounded block">
                {account || 'Chưa kết nối ví MetaMask'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">Số điện thoại:</span>
              <span className="font-medium">{user?.phone || 'Chưa có'}</span>
            </div>
          </div>
          <button className="mt-4 w-full px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition-colors" onClick={logout}>Đăng xuất</button>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="border rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Lịch sử giao dịch tháng này</h3>
          <div className="text-sm text-gray-700 mb-2">Tổng: <b>{Number(total).toFixed(6)} ETH</b></div>
          {loading ? (
            <div className="text-gray-600">Đang tải...</div>
          ) : (
            <div className="space-y-3">
              {txs.length === 0 && <div className="text-gray-600">Chưa có giao dịch.</div>}
              {txs.map((tx, i) => (
                <div key={i} className="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="text-xs text-gray-500">{tx.date}</div>
                  <div className="text-sm break-all">{tx.customer}</div>
                  <div className="text-sm font-semibold text-green-600">{tx.price_eth} ETH</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
