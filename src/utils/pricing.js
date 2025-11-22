export async function fetchEthRate() {
  // Returns USD per 1 ETH
  const res = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=ETH');
  if (!res.ok) throw new Error('Failed to fetch ETH rate');
  const data = await res.json();
  const usdPerEth = parseFloat(data?.data?.rates?.USD);
  if (!usdPerEth || Number.isNaN(usdPerEth)) throw new Error('Invalid ETH rate');
  return usdPerEth;
}

export async function convertUsdToEth(usdAmount) {
  const usdPerEth = await fetchEthRate();
  const eth = usdAmount / usdPerEth;
  return Number(eth.toFixed(8));
}

export function getReceiverAddress() {
  const envAddr = import.meta?.env?.VITE_RECEIVER_ADDRESS;
  const fallback = '0x000000000000000000000000000000000000dead';
  return envAddr && /^0x[a-fA-F0-9]{40}$/.test(envAddr) ? envAddr : fallback;
}

export function getBackendUrl() {
  const env = import.meta?.env?.VITE_BACKEND_URL;
  if (env) return env;
  // Derive from current origin to work on LAN/IP where 127.0.0.1 would fail
  return 'http://127.0.0.1:8000';
}


