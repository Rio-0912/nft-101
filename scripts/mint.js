const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const deploymentFile = path.join(__dirname, "..", "deployments", `${hre.network.name}.json`);
  const contractAddress =
    process.env.CONTRACT_ADDRESS || JSON.parse(fs.readFileSync(deploymentFile, "utf8")).address;

  const [owner] = await hre.ethers.getSigners();
  const recipient = process.env.RECIPIENT_ADDRESS || owner.address;
  const tokenURI = process.env.TOKEN_URI;
  if (!tokenURI) {
    throw new Error("Set TOKEN_URI in .env (ipfs://<metadata CID>), see scripts/pin-to-pinata.js");
  }

  const badge = await hre.ethers.getContractAt("BadgeNFT", contractAddress);
  const tx = await badge.mintBadge(recipient, tokenURI);
  const receipt = await tx.wait();

  const event = receipt.logs
    .map((log) => badge.interface.parseLog(log))
    .find((parsed) => parsed && parsed.name === "BadgeAwarded");
  const tokenId = event.args.tokenId;

  console.log(`Token #${tokenId} minted to: ${recipient}`);
  console.log("Mint tx:", tx.hash);
  console.log("Owner of token:", await badge.ownerOf(tokenId));
  console.log("Token URI:", await badge.tokenURI(tokenId));

  if (hre.network.name === "sepolia") {
    console.log(`Etherscan: https://sepolia.etherscan.io/tx/${tx.hash}`);
    console.log(`Import in MetaMask -> NFTs: contract ${contractAddress}, token ID ${tokenId}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
