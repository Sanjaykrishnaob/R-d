import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import IdentityArtifact from './contracts/Identity.json';
import './App.css';
import './Admin.css';

const CONTRACT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

function App() {
  const [account, setAccount] = useState(null);
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Check if connected to Hardhat Localhost (Chain ID 31337)
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== '0x7a69') { // 31337 in hex
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x7a69' }],
            });
          } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: '0x7a69',
                      chainName: 'Hardhat Localhost',
                      rpcUrls: ['http://127.0.0.1:8545'],
                      nativeCurrency: {
                        name: 'ETH',
                        symbol: 'ETH',
                        decimals: 18,
                      },
                    },
                  ],
                });
              } catch (addError) {
                console.error("Failed to add network:", addError);
              }
            } else {
              console.error("Failed to switch network:", switchError);
            }
          }
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        checkAdmin(accounts[0]);
      } catch (error) {
        console.error("Error connecting to MetaMask", error);
      }
    } else {
      alert("MetaMask not detected");
    }
  };

  const checkAdmin = async (connectedAccount) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, IdentityArtifact.abi, provider);
      const admin = await contract.admin();
      if (admin.toLowerCase() === connectedAccount.toLowerCase()) {
        setIsAdmin(true);
        loadUsers(contract);
      }
    } catch (error) {
      console.error("Error checking admin:", error);
    }
  };

  const loadUsers = async (contract) => {
    try {
      const userAddresses = await contract.getAllUsers();
      const userList = [];
      for (const addr of userAddresses) {
        const identity = await contract.getIdentity(addr);
        userList.push({ address: addr, ...identity });
      }
      setUsers(userList);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const verifyUser = async (userAddress) => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, IdentityArtifact.abi, signer);
      
      const tx = await contract.verifyIdentity(userAddress);
      await tx.wait();
      
      setStatus(`User ${userAddress.slice(0,6)}... verified successfully!`);
      loadUsers(contract); // Reload list
    } catch (error) {
      console.error("Verification failed:", error);
      setStatus("Verification failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const uploadToIPFS = async (fileToUpload) => {
    const formData = new FormData();
    formData.append('file', fileToUpload);

    const response = await fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload to IPFS');
    }

    const data = await response.json();
    return data.ipfsHash;
  };

  const createIdentity = async () => {
    if (!name || !file || !account) return;
    setLoading(true);
    setStatus('Uploading to IPFS...');

    try {
      const ipfsHash = await uploadToIPFS(file);
      setStatus(`IPFS Upload successful. Hash: ${ipfsHash}. Confirming transaction...`);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, IdentityArtifact.abi, signer);

      const tx = await contract.createIdentity(name, ipfsHash);
      await tx.wait();

      setStatus('Identity Created Successfully!');
    } catch (error) {
      console.error(error);
      setStatus('Error creating identity: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="card">
          <h1>Decentralized Identity</h1>
          <p className="subtitle">Secure KYC Verification System</p>
          
          {!account ? (
            <button onClick={connectWallet}>Connect Wallet</button>
          ) : (
            <div>
              <div className="wallet-info">
                <span className="dot"></span>
                {account.slice(0, 6)}...{account.slice(-4)}
              </div>
              
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  placeholder="Enter your full name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Identity Document</label>
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                />
              </div>

              <button onClick={createIdentity} disabled={loading}>
                {loading ? 'Processing...' : 'Create Identity'}
              </button>

              {status && (
                <div className="status-message">
                  {status}
                </div>
              )}

              {isAdmin && (
                <div className="admin-panel">
                  <h3>Admin Panel (Government)</h3>
                  <div className="user-list">
                    {users.map((user, index) => (
                      <div key={index} className="user-item">
                        <span>{user.name} ({user.address.slice(0,6)}...)</span>
                        {user.isVerified ? (
                          <span className="verified-badge">✅ Verified</span>
                        ) : (
                          <button onClick={() => verifyUser(user.address)} disabled={loading}>
                            Verify User
                          </button>
                        )}
                      </div>
                    ))}
                    {users.length === 0 && <p>No users found.</p>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;