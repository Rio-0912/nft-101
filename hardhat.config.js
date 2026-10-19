require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { PRIVATE_KEY, GANACHE_URL, SEPOLIA_RPC_URL, ETHERSCAN_API_KEY } = process.env;
const accounts = PRIVATE_KEY ? [PRIVATE_KEY] : [];
// Ganache has its own pre-funded accounts, so it can use a separate key
const ganacheAccounts = process.env.GANACHE_PRIVATE_KEY ? [process.env.GANACHE_PRIVATE_KEY] : accounts;

module.exports = {
  // Ganache 7.x stops at the Shanghai fork, so compile for it (and keep OpenZeppelin at 5.4,
  // the last release that doesn't need Cancun's MCOPY opcode)
  solidity: {
    version: "0.8.28",
    settings: { evmVersion: "shanghai" }
  },
  networks: {
    // Ganache CLI listens on 8545; the Ganache desktop app uses 7545
    ganache: {
      url: GANACHE_URL || "http://127.0.0.1:8545",
      accounts: ganacheAccounts
    },
    // Public testnet, needed for the Etherscan and mobile wallet steps
    sepolia: {
      url: SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
      chainId: 11155111,
      accounts
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY || ""
  },
  sourcify: {
    enabled: false
  }
};
