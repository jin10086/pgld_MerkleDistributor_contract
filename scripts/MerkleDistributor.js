// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile 
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy

  const binance = "0x616eFd3E811163F8fc180611508D72D842EA7D07";
  const binance_signer = await ethers.provider.getSigner(binance);
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [binance]}
  )

  const MerkleDistributor = await hre.ethers.getContractFactory("MerkleDistributor");

  let j = {"merkleRoot":"0xf1bf64c53e557ba2f916bc9b849429224809c5fafe1aa7776aa0b9134bf80a02","tokenTotal":"0x0200","claims":{"0x0000000000000000000000000000000000004650":{"index":0,"amount":"0x0100","proof":["0xad186e650d41eaac54c31619be2550b0a6f6bcf97630c9a3ea76904d6de7b629"]},"0x0000000000000000000000000000000000004651":{"index":1,"amount":"0x0100","proof":["0x1fe16bf4023f00ac464579896ca1c2b004fedea5f827498ac6321c2907ee5dc9"]}}}


  let token = await hre.ethers.getContractAt("ERC20","0x6B175474E89094C44Da98b954EedeAC495271d0F")
  let erc721token = await hre.ethers.getContractAt("@openzeppelin/contracts/token/ERC721/IERC721.sol:IERC721","0x03Ea00B0619e19759eE7ba33E8EB8E914fbF52Ea")

  
  let merkleRoot = j['merkleRoot']
  
  const merkleDistributor = await MerkleDistributor.deploy(token.address,merkleRoot,erc721token.address);

  await merkleDistributor.deployed();

  console.log("merkleDistributor deployed to:", merkleDistributor.address);


  //transfer dai to distributor cointract
  await token.connect(binance_signer).transfer(merkleDistributor.address,111111111)


  let account = "0x0000000000000000000000000000000000004650"
  let merkledata = j['claims'][account]
  console.log(merkledata)
  await merkleDistributor.claim(merkledata.index,account,merkledata.amount,merkledata.proof);

  
  account = "0x0000000000000000000000000000000000004651"
  merkledata = j['claims'][account]
  console.log(merkledata)
  await merkleDistributor.claim(merkledata.index,account,merkledata.amount,merkledata.proof);



}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
