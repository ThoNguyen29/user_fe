// src/components/MetaMaskConnect.jsx
import React from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { FaWallet, FaSpinner } from 'react-icons/fa';

const MetaMaskConnect = ({ className = "" }) => {
  const { 
    account, 
    isConnected, 
    isConnecting, 
    error, 
    connectWallet, 
    disconnectWallet,
    chainId 
  } = useWeb3();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getChainName = (chainId) => {
    switch (chainId) {
      case '0x1':
        return 'Ethereum Mainnet';
      case '0xaa36a7':
        return 'Sepolia Testnet';
      case '0x5':
        return 'Goerli Testnet';
      default:
        return `Chain ${chainId}`;
    }
  };

  if (isConnected && account) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium">{formatAddress(account)}</span>
        </div>
        
        <div className="text-xs text-gray-600">
          {getChainName(chainId)}
        </div>
        
        <button
          onClick={disconnectWallet}
          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${isConnecting 
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
          }
        `}
      >
        {isConnecting ? (
          <>
            <FaSpinner className="animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <FaWallet />
            <span>Connect MetaMask</span>
          </>
        )}
      </button>
      
      {error && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 text-xs rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default MetaMaskConnect;
