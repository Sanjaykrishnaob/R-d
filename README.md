# Decentralized Identity & KYC Verification System

## Project Structure

- **client**: React frontend application.
- **server**: Node.js backend server.
- **smart-contracts**: Hardhat project for Ethereum/Polygon smart contracts.

## Setup Instructions

### Prerequisites
- Node.js installed.
- MetaMask extension installed in your browser.
- **IPFS Node**: You need a local IPFS node running.
  - Install [IPFS Desktop](https://docs.ipfs.tech/install/ipfs-desktop/) or CLI.
  - Run `ipfs daemon` (if using CLI).
  - Ensure API is at port 5001 and Gateway at 8080.
  - *Note*: You might need to configure CORS for IPFS to allow requests from your server.
    ```bash
    ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:5000", "http://127.0.0.1:5000"]'
    ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST"]'
    ```

### 1. Smart Contracts (Polygon Amoy Deployment)
1. Navigate to `smart-contracts`:
   ```bash
   cd smart-contracts
   npm install
   ```
2. **Configure Environment**:
   - Open `smart-contracts/.env`.
   - Replace `YOUR_PRIVATE_KEY_HERE` with your MetaMask private key (Export from MetaMask -> Account Details -> Show Private Key).
   - *Note: Ensure this account has Amoy MATIC tokens. Get them from the [Polygon Amoy Faucet](https://faucet.polygon.technology/).*

3. Deploy to Polygon Amoy:
   ```bash
   npx hardhat run scripts/deploy.js --network amoy
   ```
4. **Important**: Copy the deployed address from the console output.
5. Open `client/src/App.js` and replace `YOUR_DEPLOYED_CONTRACT_ADDRESS` with the address you just copied.
6. (Optional) If you change the contract, copy the new ABI from `smart-contracts/artifacts/contracts/Identity.sol/Identity.json` to `client/src/contracts/Identity.json`.

### 2. Server (Backend)
1. Navigate to `server`:
   ```bash
   cd server
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
   *Server runs on http://localhost:5000*

### 3. Client (Frontend)
1. Navigate to `client`:
   ```bash
   cd client
   npm install
   ```
2. Start the React app:
   ```bash
   npm start
   ```
3. Open http://localhost:3000.
4. Connect MetaMask (ensure it's connected to **Localhost 8545**).
   - Network Name: Localhost 8545
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH
5. Import one of the private keys from the `npx hardhat node` terminal into MetaMask to have funds.

## Tech Stack
- Ethereum / Polygon (Hardhat for local dev)
- IPFS (via ipfs-http-client)
- Node.js (Express + Multer)
- React
- MetaMask
