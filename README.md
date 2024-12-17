# NFT Marketplace on Stacks

A full-featured NFT marketplace built on the Stacks blockchain, allowing users to mint, list, and trade NFTs using either STX or other fungible tokens as payment. This project demonstrates how to build decentralized applications (dApps) using Clarity smart contracts and Next.js.

## Features

- Mint NFTs to user wallets
- List NFTs for sale
- Secure ownership tracking and transfers
- Time-based listing expiration
- Pre-configured STX wallet plugin for Devnet testing

## Project Structure

- `/clarity` - Contains Clarity smart contracts and testing framework
  - `contracts/funny-dog.clar` - NFT contract for minting and managing collectible dog NFTs
  - `contracts/nft-marketplace.clar` - Decentralized marketplace contract governing NFT listing and sales
- `/front-end` - Next.js web application for the marketplace frontend which is connected to the Clarity contracts

## Getting Started

### Prerequisites

- [Hiro Platform](https://platform.hiro.so) account
- Node.js 16+ and npm/yarn/pnpm
- (Recommended) [Clarinet](https://github.com/hirosystems/clarinet) and the [Clarity VSCode Extension](https://marketplace.visualstudio.com/items?itemName=HiroSystems.clarity-lsp)

### Setup Development Environment

1. **Start Devnet in Hiro Platform**
   - Log into the [Hiro Platform](https://platform.hiro.so)
   - Navigate to your project and start Devnet
   - Copy your API key from either:
     - The Devnet Stacks API URL: `https://api.platform.hiro.so/v1/ext/<YOUR-API-KEY>/stacks-blockchain-api`
     - Or from https://platform.stg.hiro.so/settings/api-keys

2. **Configure Local Environment**
   
   Git clone the project code to your local machine via HTTPS or SSH and navigate to the project root in your terminal.
   ```bash
   # Install Clarity project dependencies
   cd clarity
   npm install

   # Configure frontend environment
   cd ../front-end
   npm install
   cp .env.example .env
   ```
   Add your Hiro Platform API key to `.env`:
   ```
   NEXT_PUBLIC_PLATFORM_HIRO_API_KEY=your-api-key-here
   ```

3. **Start the Frontend Application**
   
   Start the Next.js application from the front-end directory.
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000) to view the marketplace. If Devnet is running, your test wallets will already be funded and connected for testing.

## Testing with Devnet

The Hiro Platform's Devnet provides a sandboxed environment for testing your marketplace. Here's how to use it:

### 1. Deploy and Test Contracts

1. Open your project in the Hiro Platform
2. Click "Start Devnet" to initialize your testing environment
3. Navigate to the "Contracts" tab
4. Deploy the contracts in order:
   - First deploy `funny-dog.clar`
   - Then deploy `nft-marketplace.clar`

### 2. Test NFT Minting

1. Select the `funny-dog` contract in the interface
2. Find the `mint` function
3. Use one of the pre-funded devnet wallets as the recipient
4. Execute the mint function and verify the transaction

### 3. Test Marketplace Functions

1. Select the `nft-marketplace` contract
2. Test the following functions in sequence:
   ```
   a. list-asset
      - Use the NFT ID from your mint
      - Set a price in microSTX
      - Set an expiry block height (current + 1000)
   
   b. get-listing
      - Verify your listing details
   
   c. fulfil-listing-stx
      - Use a different pre-funded wallet
      - Purchase the listed NFT
   ```

### 4. Monitor Transactions

1. Click "View Devnet Activity" to open the dashboard
2. Monitor your transactions in real-time
3. Use the block explorer to verify:
   - NFT ownership changes
   - STX transfers
   - Contract state updates

### 5. API Integration Testing

1. Copy your Devnet API URL from the dashboard
2. Use the built-in API testing interface to try endpoints:
   ```
   GET /v2/contracts/call-read/{contract-address}/funny-dog/get-token-uri
   GET /v2/contracts/call-read/{contract-address}/nft-marketplace/get-listing
   ```
3. Use these endpoints to verify your frontend integration

## Development Workflow

1. Deploy contracts to Devnet through the Hiro Platform
2. Test contract functions using the platform's interface
3. Connect your frontend using the provided Devnet API URL
4. Iterate and test without spending real tokens
