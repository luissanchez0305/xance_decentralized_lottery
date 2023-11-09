require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

const ownerPK = process.env.OWNER_PRIVATE_KEY;
const accocunt1 = process.env.ACCOUNT_1_PRIVATE_KEY;
const accocunt2 = process.env.ACCOUNT_2_PRIVATE_KEY;
const accocunt3 = process.env.ACCOUNT_3_PRIVATE_KEY;
const accocunt4 = process.env.ACCOUNT_4_PRIVATE_KEY;
const accocunt5 = process.env.ACCOUNT_5_PRIVATE_KEY;
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        runs: 100,
        enabled: true,
      },
    },
  },
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
    goerli: {
      url: `https://goerli.infura.io/v3/a607b5016eef412a9c44f636bf72a406`,
      accounts: [`0x${ownerPK}`, `0x${accocunt1}`,`0x${accocunt2}`, `0x${accocunt3}`, `0x${accocunt4}`, `0x${accocunt5}`],
      gas: 'auto',
      gasPrice: 'auto',
    },
    binanceTest: {
      url: `https://data-seed-prebsc-1-s2.bnbchain.org:8545`,
      accounts: [
        `0x${ownerPK}`, `0x${accocunt1}`,
        /* `
        `0x${participant2}`,
        `0x${participant3}`,
        `0x${participant4}`,
        `0x${participant5}`, */
      ],
      gas: 'auto',
      gasPrice: 'auto',
    },
    binance: {
      url: `https://bsc-dataseed.binance.org`,
      accounts: [
        `0x${ownerPK}`,
        /* `0x${participant1}`,
        `0x${participant2}`,
        `0x${participant3}`,
        `0x${participant4}`,
        `0x${participant5}`, */
      ],
      gas: 'auto',
      gasPrice: 'auto',
    },
  },
};
