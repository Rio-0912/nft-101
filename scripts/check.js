// Reads the badge back from the chain (no transaction, no gas).
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const { address } = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "deployments", `${hre.network.name}.json`), "utf8")
  );
  const tokenId = process.env.TOKEN_ID || 1;
  const badge = await hre.ethers.getContractAt("BadgeNFT", address);

  console.log("Network:     ", hre.network.name);
  console.log("Contract:    ", address);
  console.log("Name/Symbol: ", await badge.name(), "/", await badge.symbol());
  console.log("Total minted:", (await badge.totalMinted()).toString());
  console.log("Token ID:    ", tokenId.toString());
  console.log("Owner:       ", await badge.ownerOf(tokenId));

  const tokenURI = await badge.tokenURI(tokenId);
  console.log("Token URI:   ", tokenURI);

  const metadata = await (
    await fetch(tokenURI.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/"))
  ).json();
  console.log("Metadata:    ", JSON.stringify(metadata, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
