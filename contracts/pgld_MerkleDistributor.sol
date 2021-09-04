pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
interface IMerkleDistributor {
    // Returns the address of the token distributed by this contract.
    function token() external view returns (address);
    // Returns the merkle root of the merkle tree containing account balances available to claim.
    function merkleRoot() external view returns (bytes32);
    // Returns true if the index has been marked claimed.
    function isClaimed(uint256 index) external view returns (bool);
    // Claim the given amount of the token to the given address. Reverts if the inputs are invalid.
    function claim(uint256 index, address account, uint256 amount, bytes32[] calldata merkleProof) external;

    // This event is triggered whenever a call to #claim succeeds.
    event Claimed(uint256 index, address account, uint256 amount);
}

contract MerkleDistributor is IMerkleDistributor {
    address public immutable override token;
    bytes32 public immutable override merkleRoot;


    IERC721 loot = IERC721(0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7);
    IERC721 xloot = IERC721(0x8bf2f876E2dCD2CAe9C3d272f325776c82DA366d);
    IERC721 ploot = IERC721(0x03Ea00B0619e19759eE7ba33E8EB8E914fbF52Ea);


    // This is a packed array of booleans.
    mapping(uint256 => uint256) private claimedBitMap;

    constructor(address token_, bytes32 merkleRoot_) public {
        token = token_;
        merkleRoot = merkleRoot_;
    }

    function isClaimed(uint256 index) public view override returns (bool) {
        uint256 claimedWordIndex = index / 256;
        uint256 claimedBitIndex = index % 256;
        uint256 claimedWord = claimedBitMap[claimedWordIndex];
        uint256 mask = (1 << claimedBitIndex);
        return claimedWord & mask == mask;
    }

    function _setClaimed(uint256 index) private {
        uint256 claimedWordIndex = index / 256;
        uint256 claimedBitIndex = index % 256;
        claimedBitMap[claimedWordIndex] = claimedBitMap[claimedWordIndex] | (1 << claimedBitIndex);
    }

    function claim(uint256 index, address account, uint256 amount, bytes32[] calldata merkleProof) external override {
        require(!isClaimed(index), 'MerkleDistributor: Drop already claimed.');

        // Verify the merkle proof.
        bytes32 node = keccak256(abi.encodePacked(index, account, amount));
        require(MerkleProof.verify(merkleProof, merkleRoot, node), 'MerkleDistributor: Invalid proof.');

        // Mark it claimed and send the token.
        _setClaimed(index);

        uint256 tokenID = uint256(uint160(account));
        address tokenIDOwner;
        if (tokenID<=8000){
            tokenIDOwner = loot.ownerOf(tokenID);
        }else if(tokenID<=16000){
            tokenIDOwner = xloot.ownerOf(tokenID);
        }else{
            tokenIDOwner = ploot.ownerOf(tokenID);
        }
        require(IERC20(token).transfer(tokenIDOwner, amount), 'MerkleDistributor: Transfer failed.');

        emit Claimed(index, tokenIDOwner, amount);
    }
}