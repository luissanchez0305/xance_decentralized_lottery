require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config({ path: __dirname + '/.env' });

const ownerPK = process.env.OWNER_PRIVATE_KEY;
const account1 = process.env.ACCOUNT_1_PRIVATE_KEY;
// const account2 = process.env.ACCOUNT_2_PRIVATE_KEY;
// const account3 = process.env.ACCOUNT_3_PRIVATE_KEY;
// const account4 = process.env.ACCOUNT_4_PRIVATE_KEY;
// const account5 = process.env.ACCOUNT_5_PRIVATE_KEY;
// const account6 = process.env.ACCOUNT_6_PRIVATE_KEY;
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
      accounts: [`0x${ownerPK}`, `0x${account1}`,/* `0x${account2}`, `0x${account3}`, `0x${account4}`, `0x${account5}` */],
      gas: 'auto',
      gasPrice: 'auto',
    },
    binanceTest: {
      url: `https://data-seed-prebsc-2-s1.bnbchain.org:8545`,
      accounts: [
        `0x${ownerPK}`, `0x${account1}`,
        // `0x${account6}`,
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
        `0x${ownerPK}`,`0x${account1}`,
        /*`0x${participant2}`,
        `0x${participant3}`,
        `0x${participant4}`,
        `0x${participant5}`, */
      ],
      gas: 'auto',
      gasPrice: 'auto',
    },
    solanaTest: {
      url: `https://api.testnet.solana.com`,
      accounts: [`0x${ownerPK}`],
      gas: 'auto',
      gasPrice: 'auto',
    }
  },
};
