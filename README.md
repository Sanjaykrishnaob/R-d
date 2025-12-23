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
   - Copy the example environment file:
     ```bash
     cp .env.example .env
     ```
     (Or manually create `.env` and copy the contents of `.env.example` into it)
   - Open `.env`.
   - Replace `YOUR_PRIVATE_KEY_HERE` with your MetaMask private key (Export from MetaMask -> Account Details -> Show Private Key).
   - *Note: Ensure this account has Amoy MATIC tokens. Get them from the [Polygon Amoy Faucet](https://faucet.polygon.technology/).*

3. Deploy to Polygon Amoy:
   ```bash
   npx hardhat run scripts/deploy.js --network amoy
   ```
4. **Important**: Copy the deployed address from the console output.
5. Open `client/src/App.js` and replace `YOUR_DEPLOYED_CONTRACT_ADDRESS` with the address you just copied.
6. **Update Chain ID**:
   - In `client/src/App.js`, the code checks for a specific Chain ID (default is often Localhost `0x7a69`).
   - If deploying to **Polygon Amoy**, update the chain ID check to `0x13882` (80002).
7. (Optional) If you change the contract, copy the new ABI from `smart-contracts/artifacts/contracts/Identity.sol/Identity.json` to `client/src/contracts/Identity.json`.

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
4. Connect MetaMask (ensure it's connected to **Polygon Amoy** or **Localhost** depending on your setup).

## Deployment Guide

### 1. Deploying Frontend (Vercel/Netlify)
The `client` folder is a standard React app.
1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com) or [Netlify](https://www.netlify.com).
3. Import your repository.
4. **Important**: Configure the "Root Directory" settings:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Click Deploy.

### 2. Deploying Backend (Render/Railway/Heroku)
The `server` is a Node.js Express app.
1. Create a new Web Service on [Render](https://render.com) or [Railway](https://railway.app).
2. Connect your GitHub repository.
3. **Settings**:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables (if any).

### ⚠️ CRITICAL: IPFS in Production
Your current server code connects to a **Local IPFS Node** (`http://127.0.0.1:5001`).
- **This will NOT work in the cloud** (Vercel/Render) because they don't have your local IPFS node.
- **Solution**: You must switch to a remote IPFS provider like **Pinata** or **Infura**.
  1. Sign up for [Pinata](https://www.pinata.cloud/).
  2. Update `server/src/server.js` to use the Pinata API instead of `localhost:5001`.


## Tech Stack
- Ethereum / Polygon (Hardhat for local dev)
- IPFS (via ipfs-http-client)
- Node.js (Express + Multer)
- React
- MetaMask
