const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BadgeNFT", function () {
  async function deploy() {
    const [owner, student, other] = await ethers.getSigners();
    const badge = await ethers.deployContract("BadgeNFT");
    return { badge, owner, student, other };
  }

  it("awards a badge with its metadata URI", async function () {
    const { badge, student } = await deploy();
    await expect(badge.mintBadge(student.address, "ipfs://metadataCid"))
      .to.emit(badge, "BadgeAwarded")
      .withArgs(student.address, 1n, "ipfs://metadataCid");

    expect(await badge.ownerOf(1)).to.equal(student.address);
    expect(await badge.tokenURI(1)).to.equal("ipfs://metadataCid");
    expect(await badge.totalMinted()).to.equal(1n);
  });

  it("only lets the owner award badges", async function () {
    const { badge, student, other } = await deploy();
    await expect(badge.connect(other).mintBadge(student.address, "ipfs://x"))
      .to.be.revertedWithCustomError(badge, "OwnableUnauthorizedAccount");
  });
});
