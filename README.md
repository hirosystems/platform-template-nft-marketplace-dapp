This is a NFT Marketplace built on Stacks using clarity and [Next.js](https://nextjs.org) for the front-end

/clarity folder contains the clarity contracts and everything you need to test and validate the contracts

/front-end folder contains the front-end code

# Getting Started
## Setup Devnet
### Start Devnet in the Platform
1. Login to the Platform
2. From the  nft-marketplace project start Devnet
3. Once Devnet is started, select the api key shown in the Devnet Stacks API URL 
which will be of the form
```
https://api.platform.stg.hiro.so/v1/ext/abfd1aee0cbdd85d67b42f04cc3d0b52/stacks-blockchain-api
```
Your api key will be the value after ext/ and before /stacks-blockchain-api. In this example it is abfd1aee0cbdd85d67b42f04cc3d0b52

### Configure the Front-End
2. Copy the .env.example to .env
3. Add your Platform API Key to the env variable NEXT_PUBLIC_PLATFORM_HIRO_API_KEY in your .env file
This will automatically configure this application to use the platform hosted devnet that is currently running.
The devnet wallet will be then used to execute the contract calls and you won't need to use any wallet extension to interact with the marketplace.

### Run the Front-End
In the front-end folder, run the development server:
```bash
cd front-end
```

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
