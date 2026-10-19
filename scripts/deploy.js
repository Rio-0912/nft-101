const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);

  const BadgeNFT = await hre.ethers.getContractFactory("BadgeNFT");
  const badge = await BadgeNFT.deploy();
  await badge.waitForDeployment();

  const address = await badge.getAddress();
  const txHash = badge.deploymentTransaction().hash;
  console.log("BadgeNFT deployed to:", address);
  console.log("Deployment tx:", txHash);

  // Saved so mint.js can find the contract without hardcoding the address
  const outDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, `${hre.network.name}.json`),
    JSON.stringify({ address, txHash, deployer: deployer.address }, null, 2)
  );

  if (hre.network.name === "sepolia") {
    console.log(`Etherscan: https://sepolia.etherscan.io/address/${address}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
