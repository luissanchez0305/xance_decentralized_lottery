const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
const { before } = require("node:test");
const exp = require("constants");

describe("Xance", function () {
    async function deployFixture() {
        const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
        const ONE_WEI = 1_000_000_000_000_000_000n;
        const d = new Date('2023-08-06T05:00:00Z');
        const expireTime = d.getTime() / 1000; //Math.floor(Date.now() / 1000) + 60 * 60 * 1;

        // Contracts are deployed using the first signer/account by default
        const oneToken = ONE_WEI;
        const [owner, account1, account2, account3, account4, account5] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("Token");
        const token = await Token.deploy();

        const Xance = await ethers.getContractFactory("Xance");
        const xance = await Xance.deploy(account1.address, token.target, expireTime);

        await token.transfer(xance.target, oneToken * 500n);
        await xance.setMaxInventoryNumber();
        return { provider: ethers.provider, expireTime, oneToken, xance, token, owner, account1, account2, account3, account4, account5 };
    }

    describe("Deployment", function () {
        it("Should set the right owner and token", async function () {
            const { xance, token, owner } = await loadFixture(deployFixture);

            expect(await xance.owner()).to.equal(owner.address);
            expect(await xance.usdToken()).to.equal(token.target);
        });
    });

    describe("Buy", function () {
        it("Should buy tickets", async function () {
            const { xance, token, oneToken, account1, account2, account3, account4, account5 } = await loadFixture(deployFixture);

            await token.transfer(account1.address, oneToken);
            await token.transfer(account2.address, oneToken);
            await token.transfer(account3.address, oneToken);
            await token.transfer(account4.address, oneToken);
            await token.transfer(account5.address, oneToken);

            await token.connect(account1).approve(xance.target, oneToken);
            await token.connect(account2).approve(xance.target, oneToken);
            await token.connect(account3).approve(xance.target, oneToken);
            await token.connect(account4).approve(xance.target, oneToken);
            await token.connect(account5).approve(xance.target, oneToken);

            await xance.connect(account1).buy([1], [4]);
            await xance.connect(account2).buy([2], [1]);
            await xance.connect(account3).buy([3,10], [1,2]);
            await xance.connect(account4).buy([4], [3]);
            await xance.connect(account5).buy([5,5], [1,3]);

            expect(await xance.getSoldNumbersByAddress(1, account1.address)).to.equal(4);
            expect(await xance.getSoldNumbersByAddress(2, account2.address)).to.equal(1);
            expect(await xance.getSoldNumbersByAddress(10, account3.address)).to.equal(2);
            expect(await xance.getSoldNumbersByAddress(4, account4.address)).to.equal(3);
            expect(await xance.getSoldNumbersByAddress(5, account5.address)).to.equal(4);
        });
    });

    describe("Claim", function () {
        it("Should buy tickets and claim", async function () {
            const { xance, owner, expireTime, oneToken, token, account1, account2, account3, account4, account5 } = await loadFixture(deployFixture);

            const max = await xance.maxInventoryNumber();
            console.log('max', max.toString());
            await token.transfer(account1.address, oneToken);
            await token.transfer(account2.address, oneToken * 10n);
            await token.transfer(account3.address, oneToken * 10n);
            await token.transfer(account4.address, oneToken * 10n);
            await token.transfer(account5.address, oneToken * 10n); 

            await token.connect(account1).approve(xance.target, oneToken);
            await token.connect(account2).approve(xance.target, oneToken * 10n);
            await token.connect(account3).approve(xance.target, oneToken * 10n);
            await token.connect(account4).approve(xance.target, oneToken * 10n);
            await token.connect(account5).approve(xance.target, oneToken * 10n);

            await xance.connect(account1).buy([1], [1]);
            await xance.connect(account2).buy([2], [6]);
            await xance.connect(account3).buy([3,10], [6,8]);
            await xance.connect(account4).buy([4,10], [5,14]);
            await xance.connect(account5).buy([5,5], [1,3]);

            await time.increaseTo(expireTime + 1);
            await xance.connect(owner).setFirstPrize(1010);
            
            await xance.connect(account3).claim();
            const finalBalance = await token.balanceOf(account3.address);
            /*
            balance inicial 10
            compra de 8 numero 10 = 8 * 0.25 = 2
            compra de 6 numero 3 = 6 * 0.25 = 1.5
            Total de compra 3.5
            balance 6.5
            numero ganador 1010
            8 numeros 10 = 8 * 14 = 112
            balance final 118.5
            */
            expect(finalBalance.toString()).to.equal('118500000000000000000');
        });
    });

});