// src/contexts/Web3Context.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [chainId, setChainId] = useState(null);

  // Initialize provider on component mount
  useEffect(() => {
    initializeProvider();
  }, []);

  const initializeProvider = async () => {
    try {
      const ethereumProvider = await detectEthereumProvider();
      if (ethereumProvider) {
        setProvider(ethereumProvider);
        
        // Check if already connected
        const accounts = await ethereumProvider.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await handleAccountsChanged(accounts);
        }

        // Listen for account changes
        ethereumProvider.on('accountsChanged', handleAccountsChanged);
        ethereumProvider.on('chainChanged', handleChainChanged);
      } else {
        setError('MetaMask not detected. Please install MetaMask extension.');
      }
    } catch (err) {
      console.error('Error initializing provider:', err);
      setError('Failed to initialize MetaMask provider');
    }
  };

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      setAccount(null);
      setSigner(null);
      setIsConnected(false);
    } else {
      setAccount(accounts[0]);
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      const ethersSigner = await ethersProvider.getSigner();
      setSigner(ethersSigner);
      setIsConnected(true);
      setError(null);
    }
  };

  const handleChainChanged = (chainId) => {
    setChainId(chainId);
    // Reload page to reset state
    window.location.reload();
  };

  const connectWallet = async () => {
    if (!provider) {
      setError('MetaMask not detected. Please install MetaMask extension.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });
      
      if (accounts.length > 0) {
        await handleAccountsChanged(accounts);
        
        // Get chain ID
        const chainId = await provider.request({ method: 'eth_chainId' });
        setChainId(chainId);
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      if (err.code === 4001) {
        setError('User rejected the connection request');
      } else {
        setError('Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setIsConnected(false);
    setChainId(null);
    setError(null);
  };

  const switchToSepolia = async () => {
    if (!provider) return;

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia testnet
      });
    } catch (err) {
      if (err.code === 4902) {
        // Chain not added, try to add it
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia Test Network',
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              nativeCurrency: {
                name: 'SepoliaETH',
                symbol: 'SepoliaETH',
                decimals: 18,
              },
              blockExplorerUrls: ['https://sepolia.etherscan.io/'],
            }],
          });
        } catch (addErr) {
          console.error('Error adding Sepolia network:', addErr);
        }
      } else {
        console.error('Error switching to Sepolia:', err);
      }
    }
  };

  const value = {
    account,
    provider,
    signer,
    isConnected,
    isConnecting,
    error,
    chainId,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};
