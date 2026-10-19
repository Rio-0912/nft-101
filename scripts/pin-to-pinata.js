// Pins the badge image and its metadata to Pinata (remote IPFS pinning service).
// Usage: node scripts/pin-to-pinata.js   (needs PINATA_JWT in .env)
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const IMAGE_PATH = path.join(ROOT, "assets", "badge.jpg");
const METADATA_PATH = path.join(ROOT, "metadata.json");

async function pinFile(name, blob) {
  const form = new FormData();
  form.append("file", blob, name);
  form.append("network", "public"); // v3 uploads are private unless this is set
  form.append("name", name);

  const res = await fetch("https://uploads.pinata.cloud/v3/files", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.PINATA_JWT}` },
    body: form
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Pinata upload of ${name} failed: ${JSON.stringify(body)}`);
  return body.data.cid;
}

async function main() {
  if (!process.env.PINATA_JWT) throw new Error("Set PINATA_JWT in .env");

  const imageCid = await pinFile("badge.jpg", new Blob([fs.readFileSync(IMAGE_PATH)], { type: "image/jpeg" }));
  console.log("Image CID:", imageCid);

  const metadata = JSON.parse(fs.readFileSync(METADATA_PATH, "utf8"));
  metadata.image = `ipfs://${imageCid}`;
  fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2) + "\n");

  const metadataCid = await pinFile(
    "metadata.json",
    new Blob([fs.readFileSync(METADATA_PATH)], { type: "application/json" })
  );
  console.log("Metadata CID:", metadataCid);
  console.log(`Image:    https://gateway.pinata.cloud/ipfs/${imageCid}`);
  console.log(`Metadata: https://gateway.pinata.cloud/ipfs/${metadataCid}`);
  console.log(`\nAdd this to .env:\nTOKEN_URI=ipfs://${metadataCid}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
