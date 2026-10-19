// Verifies the deployed contract on Sourcify (API v2, no API key needed).
// hardhat-verify 2.x still calls Sourcify's removed v1 API, hence this script.
// Usage: node scripts/verify-sourcify.js [network]   (default: sepolia)
const fs = require("fs");
const path = require("path");

const CHAIN_IDS = { sepolia: 11155111 };
const network = process.argv[2] || "sepolia";

async function main() {
  const { address } = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "deployments", `${network}.json`), "utf8")
  );
  const buildInfoDir = path.join(__dirname, "..", "artifacts", "build-info");
  const buildInfo = fs
    .readdirSync(buildInfoDir)
    .map((f) => JSON.parse(fs.readFileSync(path.join(buildInfoDir, f), "utf8")))
    .find((b) => b.input.sources["contracts/BadgeNFT.sol"]);

  const res = await fetch(`https://sourcify.dev/server/v2/verify/${CHAIN_IDS[network]}/${address}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "nft-badge-lab" },
    body: JSON.stringify({
      stdJsonInput: buildInfo.input,
      compilerVersion: buildInfo.solcLongVersion,
      contractIdentifier: "contracts/BadgeNFT.sol:BadgeNFT"
    })
  });
  const { verificationId } = await res.json();
  if (!verificationId) throw new Error(`Sourcify rejected the request (HTTP ${res.status})`);

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const job = await (await fetch(`https://sourcify.dev/server/v2/verify/${verificationId}`)).json();
    if (job.isJobCompleted) {
      if (job.error) throw new Error(JSON.stringify(job.error));
      console.log("Verified on Sourcify:", job.contract.match);
      console.log(`https://repo.sourcify.dev/${CHAIN_IDS[network]}/${address}`);
      return;
    }
  }
  throw new Error("Sourcify verification timed out");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
