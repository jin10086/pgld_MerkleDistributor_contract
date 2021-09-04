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
      params: [binance]
    })

    const MerkleDistributor = await hre.ethers.getContractFactory("MerkleDistributor");

    let j = {
      "merkleRoot": "0xf1bf64c53e557ba2f916bc9b849429224809c5fafe1aa7776aa0b9134bf80a02",
      "tokenTotal": "0x0200",
      "claims": {
        "0x0000000000000000000000000000000000004650": {
          "index": 0,
          "amount": "0x0100",
          "proof": ["0xad186e650d41eaac54c31619be2550b0a6f6bcf97630c9a3ea76904d6de7b629"]
        },
        "0x0000000000000000000000000000000000004651": {
          "index": 1,
          "amount": "0x0100",
          "proof": ["0x1fe16bf4023f00ac464579896ca1c2b004fedea5f827498ac6321c2907ee5dc9"]
        }
      }
    }


    let j1 = {
      "0x0000000000000000000000000000000000000001": {
        "index": 0,
        "amount": "0x01e43fd070f881700000",
        "proof": ["0x8acb2edf4d41d7b204e44e2b4fadd519316a34adb620f6fadb1886bed3f66928", "0x3f1236cea38c884aef50566e0db3fe6b6886ab422b480e4ede3838f16b73b46a", "0x628a209f84231a06382fde67e879b59a21720500c31c34b959a2273a689dc676", "0x77d35719d6b10dd203f636f2bfc54e7b69ee0d7b13cd2db965180037da6e1602", "0x18a4ec7949b342a6b5f7369348ec9329054cd9683ea8814258507958435ee9c5", "0x6333e56a193f706c46dc87c76fd4032483dd1a965cc01f017f79a559cb004b62", "0x6ac555f064d596188729a693c4d5d023b1af1ac116daa01b9db733200224cc0b", "0xa7af177fec63b082c10dd0b3889bbb26656ba2786e9234dc5f4556d95aa5bcd5", "0x8ca65b1c426f5c9b1e9e67d50b93b1266d34c9de06fb1bebf88f8eaf90f7f767", "0x66dbed0a1d61d8f258984ec28e3370c8cb4161c51b83ab5fe5c37df8e458861d", "0xe5a3f08966d34d80c108a26b79b118642b66a6e42cd9f9a7154576ba52e9e20b", "0x7fb587ab99efc2efde036308cfdaa4e9bdb4e6d3ef94198f7596be2b7f497a60", "0x58a1e13e0afe5ebe78775f0fa122564bf5d57d91b4639f18694651e5335d99ca", "0x9f756867fde7e983effb640a523ab9217b9c0adcaa93c92f922782974516155c", "0x508b2422b09e6992e4cd2ceceeadec069804452eb60dd23753ccf7e9cb17a815"]
      }
    }
    let merkleRoot = '0x3d0d9508a6cd4d834a2fa7a85b953ab9e5102005f2e6d7063791d780e00cd651'

      let token = await hre.ethers.getContractAt("ERC20", "0x6B175474E89094C44Da98b954EedeAC495271d0F")


      // let merkleRoot = j['merkleRoot']

      const merkleDistributor = await MerkleDistributor.deploy(token.address, merkleRoot);

      await merkleDistributor.deployed();

      console.log("merkleDistributor deployed to:", merkleDistributor.address);


      //transfer dai to distributor cointract
      await token.connect(binance_signer).transfer(merkleDistributor.address, "8932822431107594059776")


      let account = "0x0000000000000000000000000000000000000001"
      let merkledata = j1[account]
      console.log(merkledata)
      await merkleDistributor.claim(merkledata.index, account, "8932822431107594059776", merkledata.proof);


      // account = "0x0000000000000000000000000000000000004651"
      // merkledata = j['claims'][account]
      // console.log(merkledata)
      // await merkleDistributor.claim(merkledata.index, account, merkledata.amount, merkledata.proof);



    }

    // We recommend this pattern to be able to use async/await everywhere
    // and properly handle errors.
    main()
      .then(() => process.exit(0))
      .catch(error => {
        console.error(error);
        process.exit(1);
      });