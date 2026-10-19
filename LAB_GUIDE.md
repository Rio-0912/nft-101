# Lab 6A: Create Non-Fungible Tokens (NFTs), updated procedure (Oct 2026)

The reference chapter (Apress, 2022) uses Truffle, Ganache and the Rinkeby/Ropsten testnets.
Since then, Truffle and Ganache have been discontinued (Consensys, 2023) and Rinkeby, Ropsten and Goerli have
been shut down. This procedure uses the current equivalents:

| Book (2022)          | This lab (2026)                                   |
|----------------------|---------------------------------------------------|
| Truffle              | Hardhat 2.29 + ethers v6                          |
| OpenZeppelin 4.x     | OpenZeppelin 5.4 (`Ownable(msg.sender)`, `_safeMint`) |
| Ganache              | Ganache 7.9 (still works for local; compiled for Shanghai EVM) |
| Rinkeby / Ropsten    | Sepolia testnet                                   |
| IPFS daemon (go-ipfs)| IPFS Desktop / Kubo                               |
| Pinata legacy API    | Pinata v3 upload API (`network=public`)           |

Take a screenshot at every step marked 📸 and paste it in the report with the caption given.

---

## 1. Create the project
```bash
cd ~ && mkdir -p BTA/lab6a && cd BTA/lab6a      # (this project folder is nft-badge-lab)
npm init -y
npm install --save-dev hardhat@^2.29 @nomicfoundation/hardhat-toolbox dotenv
npm install @openzeppelin/contracts@~5.4.0
npx hardhat init        # "Create a JavaScript project"
```
📸 *Fig 2: Hardhat project initialised with OpenZeppelin installed.*

Contract: `contracts/BadgeNFT.sol` (ERC-721 with URI storage, only the owner can award badges).
```bash
npx hardhat compile
npx hardhat test
```
📸 *Fig 3: Contract compiled and unit tests passing.*

## 2. Configure the network to deploy on Ganache
Start Ganache in a separate terminal:
```bash
npm run ganache          # ganache --wallet.deterministic --chain.chainId 1337
```
📸 *Fig 4: Ganache running on 127.0.0.1:8545 with 10 funded accounts.*

The `ganache` network is defined in `hardhat.config.js`.
📸 *Fig 5: hardhat.config.js showing the ganache and sepolia networks.*

## 3. Configure the private key
Copy `.env.example` to `.env`. Set `GANACHE_PRIVATE_KEY` to a private key Ganache printed (account 0), and `PRIVATE_KEY` to your MetaMask test account (used for Sepolia).
`.env` is never shared or committed.
📸 *Fig 6: .env configured (blur the key).*

## 4. Create the badge image
`assets/badge.jpg` (1024×1024).
📸 *Fig 7: Badge image.*

## 5. Add the badge to the local IPFS
Install IPFS Desktop (https://docs.ipfs.tech/install/ipfs-desktop/) or Kubo (here: Kubo v0.43.1 in `%USERPROFILE%kubo-dlkubo`), then:
```bash
ipfs init                 # first time only (IPFS Desktop does this for you)
ipfs daemon               # leave running
ipfs add --cid-version 1 assets/badge.jpg
```
Open `http://127.0.0.1:8080/ipfs/<CID>` to view it.
📸 *Fig 8: Badge added to the local IPFS node, CID shown.*
📸 *Fig 9: Badge served from the local IPFS gateway.*

## 6. Pin the badge to a remote IPFS (Pinata)
Create a free account at https://app.pinata.cloud, then **API Keys → New Key** (permission *Files: Write* is enough), and put the JWT in `.env` as `PINATA_JWT`.
```bash
npm run pin
```
This pins `badge.jpg`, writes its CID into `metadata.json`, pins `metadata.json`, and prints `TOKEN_URI=ipfs://<metadata CID>`.
The image CID matches the one from step 5, because both use CIDv1.
📸 *Fig 10: Pinning output with image and metadata CIDs.*
📸 *Fig 11: Files listed in the Pinata dashboard.*

## 7. Create the badge metadata
`metadata.json` follows the ERC-721 / OpenSea metadata standard (`name`, `description`, `image`, `attributes`).
Copy the printed `TOKEN_URI` into `.env`.
📸 *Fig 12: metadata.json opened through the IPFS gateway.*

## 8. Deploy the smart contract
Local:
```bash
npm run deploy:ganache
```
📸 *Fig 13: Contract deployed to Ganache.*

Sepolia testnet (required for Etherscan and the mobile wallet):
1. In MetaMask, create a **separate test account**, then export its private key into `PRIVATE_KEY`.
2. Get free Sepolia ETH from a faucet (e.g. https://cloud.google.com/application/web3/faucet/ethereum/sepolia).
3. (Optional) Put an Alchemy/Infura Sepolia URL into `SEPOLIA_RPC_URL`. Otherwise a public RPC is used.
```bash
npm run deploy:sepolia
```
📸 *Fig 14: Contract deployed to Sepolia.*

## 9. Award the badge to your wallet
Set `RECIPIENT_ADDRESS` in `.env` to your MetaMask address (it defaults to the deployer).
```bash
npm run mint:ganache
npm run mint:sepolia
```
📸 *Fig 15: Badge minted on Ganache; ownerOf and tokenURI confirmed.*
📸 *Fig 16: Badge minted on Sepolia.*

## 10. Check the badge on Etherscan
Open the printed `https://sepolia.etherscan.io/tx/...` link and the contract address.
Source verification:
```bash
npm run verify:sourcify                                   # Sourcify, no key needed
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>   # Etherscan, needs ETHERSCAN_API_KEY
```
📸 *Fig 17: Mint transaction on Sepolia Etherscan (ERC-721 Token Transfer).*
📸 *Fig 18: Contract page / token tracker on Etherscan.*

## 11. Add the badge to your mobile wallet
MetaMask mobile: import the same account (Secret Recovery Phrase or private key) → switch network to **Sepolia**
(Settings → Advanced → Show test networks) → **NFTs** tab → **Import NFT** → enter the contract address and token ID `1`.
📸 *Fig 19: Badge NFT shown in MetaMask mobile.*

---

## Conclusion (draft)
In this experiment we created an ERC-721 non-fungible token that serves as a verifiable achievement badge.
The contract was written in Solidity with OpenZeppelin's audited `ERC721URIStorage` and `Ownable`
contracts, compiled and tested with Hardhat, and deployed first to a local Ganache blockchain and then to
the public Sepolia testnet. The badge image and its JSON metadata were stored on IPFS, added locally and
pinned remotely on Pinata. Because each file is addressed by a content identifier (CID), the token stores
only an `ipfs://` URI, and the data cannot be changed without changing the CID. Minting assigned a unique
token ID to the student's wallet. The transfer was confirmed on Etherscan, and the NFT was imported into
MetaMask mobile. The lab also showed that tooling changes quickly: Truffle and Ganache are now
discontinued, and the Rinkeby/Ropsten testnets have been replaced by Sepolia.

---

## Results of this run (20 Oct 2026)

| Item | Value |
|------|-------|
| Badge image CID (local IPFS = Pinata) | `bafybeifbjd6a6dfs7zyn36mnt23jt7dcjgpjt6ejkz2vykkk672v2d67sy` |
| Metadata CID / token URI | `ipfs://bafkreic4ithtd5wb6rnjmwm7l6brpdgwzemsidlzhkpre6p2mtpe6yjtje` |
| Ganache contract | `0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab` (token #1 → `0x7cBb…5FD7`) |
| Sepolia contract | `0x0De32F99FCdC12f78eb8bFB377921B0E3a7b777b` |
| Sepolia deploy tx | `0xb87c4c963cd7a1960183342b679e887d3bb45b3a71ae20bc73ac26ecbc32939b` |
| Sepolia mint tx (token #1) | `0x077d7756d0863243ff7a40d9f7099814344039e4f414d3288b83d90f4c4ca0f3` |
| Owner wallet | `0x7cBb018a9ee608D6457894260f6e79757f465FD7` |
| Source verification | Sourcify exact match |

Links for screenshots:
- Image: https://gateway.pinata.cloud/ipfs/bafybeifbjd6a6dfs7zyn36mnt23jt7dcjgpjt6ejkz2vykkk672v2d67sy
- Metadata: https://gateway.pinata.cloud/ipfs/bafkreic4ithtd5wb6rnjmwm7l6brpdgwzemsidlzhkpre6p2mtpe6yjtje
- Local gateway: http://127.0.0.1:8080/ipfs/bafybeifbjd6a6dfs7zyn36mnt23jt7dcjgpjt6ejkz2vykkk672v2d67sy
- Mint tx: https://sepolia.etherscan.io/tx/0x077d7756d0863243ff7a40d9f7099814344039e4f414d3288b83d90f4c4ca0f3
- Contract: https://sepolia.etherscan.io/address/0x0De32F99FCdC12f78eb8bFB377921B0E3a7b777b
- NFT page: https://sepolia.etherscan.io/nft/0x0De32F99FCdC12f78eb8bFB377921B0E3a7b777b/1
- Sourcify: https://repo.sourcify.dev/11155111/0x0De32F99FCdC12f78eb8bFB377921B0E3a7b777b
