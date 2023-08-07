// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  const [owner, walletPrize] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', owner.address);

  const weiAmount = (await ethers.provider.getBalance(owner.address)).toString();
  console.log(`Account balances: ${ethers.formatEther(weiAmount)} ETH`);

  let token;
  if(!fs.existsSync('scripts/testnet/deployed/token.json')) {
    token = await ethers.deployContract("Token");
    await token.waitForDeployment();

    const data = {
      address: token.target,
    };
  
    const jsonData = JSON.stringify(data);
  
    fs.writeFileSync(
      `scripts/testnet/deployed/token.json`,
      jsonData,
      function (err) {
        if (err) {
          console.log(err);
        }
        console.log('JSON data is saved.');
      },
    );
  }
  else {
    const Token = fs.readFileSync(
      'scripts/testnet/deployed/token.json',
      'utf8',
    );
    const tokenData = JSON.parse(Token);
    token = await ethers.getContractAt("Token", tokenData.address);
  }

  const date = '2023-08-08T00:30:00Z';
  const d = new Date(date);
  const expireTime = d.getTime() / 1000;
  
  const xance = await ethers.deployContract("Xance", [walletPrize.address, token.target, expireTime]);
  await xance.waitForDeployment();

  const maxAmount = ethers.parseEther('200');
  await token.transfer(xance.target, maxAmount);

  await xance.setMaxInventoryNumber();
  const data = {
    address: xance.target,
  };

  const jsonData = JSON.stringify(data);

  fs.writeFileSync(
    `scripts/testnet/deployed/xance-${date}.json`,
    jsonData,
    function (err) {
      if (err) {
        console.log(err);
      }
      console.log('JSON data is saved.');
    },
  );

  console.log(
    `Xance with ${ethers.formatEther(
      maxAmount
    )} USD and date ${date} deployed to ${xance.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
