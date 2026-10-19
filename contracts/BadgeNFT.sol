// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BadgeNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    event BadgeAwarded(address indexed recipient, uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("LabBadge", "LBG") Ownable(msg.sender) {}

    function mintBadge(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
        _tokenIdCounter++;
        uint256 newItemId = _tokenIdCounter;
        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        emit BadgeAwarded(recipient, newItemId, tokenURI);
        return newItemId;
    }

    function totalMinted() public view returns (uint256) {
        return _tokenIdCounter;
    }
}
