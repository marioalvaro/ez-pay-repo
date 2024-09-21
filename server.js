
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const { initiateUserControlledWalletsClient } = require('@circle-fin/user-controlled-wallets');

const app = express();
const PORT = process.env.PORT || 5001; // or another available port


app.use(cors());
app.use(bodyParser.json());

// Sample route
app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

app.post('/api/create-user', async (req, res) => {
  try {
      const apiKey = process.env.API_KEY;
      
      if (!apiKey) {
          return res.status(500).json({ error: 'Circle Connection Configuration Error' });
      }

      const userCreate = req.body;

      if (!userCreate || !userCreate.id) {
          return res.status(400).json({ error: 'No data provided' });
      }

      const userId = userCreate.id;
      console.log("Initializing User");
      console.log(userId);

      const circleUserSdk = initiateUserControlledWalletsClient({ apiKey });
      const response = await circleUserSdk.createUser({ userId });

      return res.json(response.data);
  } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Unable to fetch wallets' });
  }
});

app.post('/api/initialize-wallet', async (req, res) => {
  try {
      const apiKey = process.env.API_KEY;

      if (!apiKey) {
          return res.status(500).json({ error: 'Circle Connection Configuration Error' });
      }

      const initializeWallet = req.body;

      const userToken = initializeWallet.userToken;
      const accountType = initializeWallet.accountType;
      const blockchains = initializeWallet.blockchains;

      if (!userToken || !accountType || !blockchains) {
          return res.status(400).json({ error: 'Invalid data provided' });
      }

      const circleUserSdk = initiateUserControlledWalletsClient({ apiKey });
      const response = await circleUserSdk.createUserPinWithWallets({
          userToken,
          accountType,
          blockchains,
      });

      return res.json(response.data);
  } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Unable to fetch wallets' });
  }
});

app.post('/api/create-token', async (req, res) => {
  try {
      const apiKey = process.env.API_KEY;

      if (!apiKey) {
          return res.status(500).json({ error: 'Circle Connection Configuration Error' });
      }

      const tokenRequest = req.body;

      if (!tokenRequest || !tokenRequest.id) {
          return res.status(400).json({ error: 'No data provided' });
      }

      const userId = tokenRequest.id;

      const circleUserSdk = initiateUserControlledWalletsClient({ apiKey });
      const response = await circleUserSdk.createUserToken({
          userId,
      });

      return res.json(response.data);
  } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Unable to fetch wallets' });
  }
});

// POST route to call a smart contract
app.post('/api/call-contract', async (req, res) => {
  try {
      const apiKey = process.env.API_KEY;
      const entitySecret = process.env.ENTITY_SECRET;

      if (!apiKey || !entitySecret) {
          return res.status(500).json({ error: 'Circle Connection Configuration Error' });
      }

      const walletData = req.body;

      if (!walletData || !walletData.id || !walletData.contractAddress || 
          !walletData.abiFunctionSignature || !walletData.abiParameters) {
          return res.status(400).json({ error: 'Invalid data provided' });
      }

      const { id: walletId, contractAddress, abiFunctionSignature, abiParameters } = walletData;

      console.log("Calling Contract:", contractAddress);
      console.log("Function Signature:", abiFunctionSignature);
      console.log("Parameters:", abiParameters);

      const circleDeveloperSdk = initiateDeveloperControlledWalletsClient({
          apiKey,
          entitySecret,
      });

      const response = await circleDeveloperSdk.createContractExecutionTransaction({
          walletId,
          contractAddress,
          abiFunctionSignature,
          abiParameters,
          fee: {
              type: 'level',
              config: {
                  feeLevel: 'MEDIUM'
              }
          }
      });

      return res.json(response.data);
  } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Unable to call smart contract data' });
  }
});

// POST route to deploy a smart contract
app.post('/api/deploy-contract', async (req, res) => {
  try {
      const apiKey = process.env.API_KEY;
      const entitySecret = process.env.ENTITY_SECRET;

      if (!apiKey || !entitySecret) {
          return res.status(500).json({ error: 'Circle Connection Configuration Error' });
      }

      const contractData = req.body;

      if (!contractData || !contractData.id) {
          return res.status(400).json({ error: 'No data provided' });
      }

      const walletId = contractData.id;

      console.log("Deploying Contract using Wallet:", walletId);
      const name = 'Example Contract Name';
      const description = 'Example Contract Description';
      const blockchain = 'MATIC-AMOY';

      const circleContractSdk = initiateSmartContractPlatformClient({
          apiKey,
          entitySecret,
      });

      const deployment = await circleContractSdk.deployContract({
          name,
          description,
          walletId,
          blockchain,
          fee: {
              type: 'level',
              config: {
                  feeLevel: 'MEDIUM'
              }
          },
          constructorParameters: [], // Add parameters if needed
          abiJson: JSON.stringify([]), // Replace with your actual ABI
          bytecode: "YOUR_BYTECODE_HERE", // Replace with your actual bytecode
      });

      console.log(deployment.data);
      return res.json(deployment.data);
  } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Unable to deploy smart contract' });
  }
});

// POST route to get transaction details
app.post('/api/get-transaction', async (req, res) => {
  try {
      const apiKey = process.env.API_KEY;
      const entitySecret = process.env.ENTITY_SECRET;

      if (!apiKey || !entitySecret) {
          return res.status(500).json({ error: 'Circle Connection Configuration Error' });
      }

      const txInfo = req.body;

      if (!txInfo || !txInfo.id) {
          return res.status(400).json({ error: 'No data provided' });
      }

      const txId = txInfo.id;

      const circleDeveloperSdk = initiateDeveloperControlledWalletsClient({
          apiKey,
          entitySecret,
      });

      const response = await circleDeveloperSdk.getTransaction({ id: txId });
      const txData = response.data;

      return res.json(txData);
  } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Unable to fetch transactions' });
  }
});

app.post('/api/wallet/balance', async (req, res) => {
  console.log("Searching for Balances");
  try {
      const apiKey = process.env.API_KEY;
      const entitySecret = process.env.ENTITY_SECRET;

      if (!apiKey || !entitySecret) {
          return res.status(500).json({ error: 'Circle Connection Configuration Error' });
      }
      if (!req.body) {
          return res.status(400).json({ error: 'No data provided' });
      }
      const walletData = req.body;
      const walletId = walletData.id;

      const circleDeveloperSdk = initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });
      const balance = await circleDeveloperSdk.getWalletTokenBalance({ id: walletId });
      const balances = balance.data;

      return res.json({ balances });
  } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Unable to fetch wallet balance' });
  }
});

// Wallet Creation Route
app.post('/api/wallet/create', async (req, res) => {
  console.log("Creating New Wallet");
  try {
      const apiKey = process.env.API_KEY;
      const entitySecret = process.env.ENTITY_SECRET;

      if (!apiKey || !entitySecret) {
          return res.status(500).json({ error: 'Circle Connection Configuration Error' });
      }
      if (!req.body) {
          return res.status(400).json({ error: 'No data provided' });
      }
      const walletData = req.body;
      const { accountType, blockchains, walletSetId } = walletData;

      const circleDeveloperSdk = initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });
      const result = await circleDeveloperSdk.createWallets({
          accountType,
          blockchains,
          count: 1,
          walletSetId,
      });

      return res.json(result.data);
  } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Unable to create wallet' });
  }
});

// Wallet Edit Route
app.post('/api/wallet/edit', async (req, res) => {
  console.log("Editing Data");
  try {
      const apiKey = process.env.API_KEY;
      const entitySecret = process.env.ENTITY_SECRET;

      if (!apiKey || !entitySecret) {
          return res.status(500).json({ error: 'Circle Connection Configuration Error' });
      }
      if (!req.body) {
          return res.status(400).json({ error: 'No data provided' });
      }
      const walletData = req.body;
      const { id, name, refId } = walletData;

      const circleDeveloperSdk = initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });
      const result = await circleDeveloperSdk.updateWallet({ id, name, refId });

      return res.json(result.data);
  } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Unable to edit wallet' });
  }
});

// Wallet Details Route
app.post('/api/wallet/details', async (req, res) => {
  try {
      const apiKey = process.env.API_KEY;
      const entitySecret = process.env.ENTITY_SECRET;

      if (!apiKey || !entitySecret) {
          return res.status(500).json({ error: 'Circle Connection Configuration Error' });
      }
      if (!req.body) {
          return res.status(400).json({ error: 'No data provided' });
      }
      const walletData = req.body;
      const { id } = walletData;

      const circleDeveloperSdk = initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });
      const resData = await circleDeveloperSdk.getWallet({ id });
      const walletInfo = resData.data;

      return res.json(walletInfo);
  } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Unable to fetch wallet details' });
  }
});



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
