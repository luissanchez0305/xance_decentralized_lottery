const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
const exp = require("constants");
 
let xanceObj, account1Obj, account2Obj, account3Obj, account4Obj, account5Obj;

describe("Xance", function () {
    async function deployFixture() {
        console.log('hola')
        const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
        const ONE_WEI = 1_000_000_000_000_000_000n;
        const d = new Date('2024-07-17T05:00:00Z');
        const expireTime = d.getTime() / 1000; //Math.floor(Date.now() / 1000) + 60 * 60 * 1;

        // Contracts are deployed using the first signer/account by default
        const oneTokenAmount = ONE_WEI;
        const [owner, account1, account2, account3, account4, account5] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("Token");
        const token = await Token.deploy();

        const Xance = await ethers.getContractFactory("Xance");
        const xance = await Xance.deploy(account1.address, token.target, expireTime);

        await token.transfer(xance.target, oneTokenAmount * 500n);
        await xance.setMaxInventoryNumber();
        xanceObj = xance;
        account1Obj = account1;
        account2Obj = account2;
        account3Obj = account3;
        account4Obj = account4;
        account5Obj = account5;

        await token.transfer(account1Obj.address, oneTokenAmount);
        await token.transfer(account2Obj.address, oneTokenAmount);
        await token.transfer(account3Obj.address, oneTokenAmount);
        await token.transfer(account4Obj.address, oneTokenAmount);
        await token.transfer(account5Obj.address, oneTokenAmount);

        await token.connect(account1Obj).approve(xanceObj.target, oneTokenAmount);
        await token.connect(account2Obj).approve(xanceObj.target, oneTokenAmount);
        await token.connect(account3Obj).approve(xanceObj.target, oneTokenAmount);
        await token.connect(account4Obj).approve(xanceObj.target, oneTokenAmount);
        await token.connect(account5Obj).approve(xanceObj.target, oneTokenAmount);

        return { 
            provider: ethers.provider, 
            expireTime, 
            oneTokenAmount, 
            xance, 
            token, 
            owner, 
            account1, 
            account2, 
            account3, 
            account4, 
            account5 
        };
    }

    describe("Deployment", function () {
        it("Should set the right owner and token", async function () {
            const { xance, token, owner } = await loadFixture(deployFixture);

            expect(await xance.owner()).to.equal(owner.address);
            expect(await xance.usdToken()).to.equal(token.target);
        });
    });

    describe("Buy", function () {
        it("Should buy tickets with USDT", async function () {
            await xanceObj.connect(account1Obj).buy([1], [4], 0, 0);
            await xanceObj.connect(account2Obj).buy([2], [1], 0, 0);
            await xanceObj.connect(account3Obj).buy([3,10], [1,2], 0, 0);
            await xanceObj.connect(account4Obj).buy([4], [3], 0, 0);
            await xanceObj.connect(account5Obj).buy([5,5], [1,3], 0, 0);

            expect(await xanceObj.getSoldNumbersByAddress(1, account1Obj.address)).to.equal(4);
            expect(await xanceObj.getSoldNumbersByAddress(2, account2Obj.address)).to.equal(1);
            expect(await xanceObj.getSoldNumbersByAddress(10, account3Obj.address)).to.equal(2);
            expect(await xanceObj.getSoldNumbersByAddress(4, account4Obj.address)).to.equal(3);
            expect(await xanceObj.getSoldNumbersByAddress(5, account5Obj.address)).to.equal(4);
        });

        it("Should buy tickets with BNB", async function () {
            console.log('balance 1', await ethers.provider.getBalance(xanceObj.target));
            console.log('balance 1', await ethers.provider.getBalance(account1Obj.address));
            console.log('balance 1', await ethers.provider.getBalance(account2Obj.address));
            await xanceObj.connect(account2Obj).getTotalAmounts([1], [4], 2, {value: '500000000000000000'});
            // console.log('balance', await xanceObj.connect(account2Obj).getTotalAmounts([30,40,50,60,70], [4,3,2,6,4], 2));
            // await xanceObj.connect(account1Obj).getTotalAmounts([30,40,50,60,70,30,40,50,60,70,30,40,50,60,70,30,40,50,60,70], [4,3,2,6,4,4,3,2,6,4,4,3,2,6,4,4,3,2,6,4], 2);
            console.log('balance 2', await ethers.provider.getBalance(xanceObj.target));
            console.log('balance 1', await ethers.provider.getBalance(account1Obj.address));
            console.log('balance 1', await ethers.provider.getBalance(account2Obj.address));
            await xanceObj.connect(account1Obj).buy([1], [4], 1, 2);
            await xanceObj.connect(account2Obj).buy([2], [1], 1, 2);
            await xanceObj.connect(account3Obj).buy([3,10], [1,2], 1, 2);
            await xanceObj.connect(account4Obj).buy([4], [3], 1, 2);
            await xanceObj.connect(account5Obj).buy([5,5], [1,3], 1, 2);

            expect(await xanceObj.getSoldNumbersByAddress(1, account1Obj.address)).to.equal(8);
            expect(await xanceObj.getSoldNumbersByAddress(2, account2Obj.address)).to.equal(2);
            expect(await xanceObj.getSoldNumbersByAddress(10, account3Obj.address)).to.equal(4);
            expect(await xanceObj.getSoldNumbersByAddress(4, account4Obj.address)).to.equal(6);
            expect(await xanceObj.getSoldNumbersByAddress(5, account5Obj.address)).to.equal(8);
        });

    });

    /* describe("Claim & withdraw", function () {
        it("Should buy tickets and claim", async function () {
            await xanceObj.connect(account1Obj).buy([1], [1], 0, 0);
            await xanceObj.connect(account2Obj).buy([2], [6], 0, 0);
            await xanceObj.connect(account3Obj).buy([3,10], [6,8], 0, 0);
            await xanceObj.connect(account4Obj).buy([4,10], [5,4], 0, 0);
            await xanceObj.connect(account5Obj).buy([5,5], [1,3], 0, 0);

            await time.increaseTo(expireTime + 1);
            await xanceObj.connect(owner).setPrizeNumbers([1010, 1034, 1008]);
            
            await xanceObj.connect(owner).withdraw();
            await xanceObj.connect(account3Obj).claim();
            await xanceObj.connect(account4Obj).claim();
            const finalBalance = await token.balanceOf(account3Obj.address);
            /*
            --account3--
            balance inicial 10
            compra de 8 numero 10 = 8 * 0.25 = 2
            compra de 6 numero 3 = 6 * 0.25 = 1.5
            Total de compra 3.5
            balance 6.5
            numero ganador 1010
            8 numeros 10 = 8 * 14 = 112
            balance final 118.5
            * /
            expect(finalBalance.toString()).to.equal('118500000000000000000');
        });

        it("Should withdraw right amount", async function () {
            await loadFixture(deployFixture);
            await xanceObj.connect(account1Obj).buy([1], [1], 0, 2);
            await xanceObj.connect(account2Obj).buy([2], [6], 0, 2);
            await xanceObj.connect(account3Obj).buy([3,10], [6,8], 0, 2);
            await xanceObj.connect(account4Obj).buy([4,10], [5,4], 0, 2);
            await xanceObj.connect(account5Obj).buy([5,5], [1,3], 0, 2);
            
            await time.increaseTo(expireTime + 1);
            await xanceObj.connect(owner).setPrizeNumbers([1010, 1010, 1003]);
            
            await xanceObj.connect(owner).withdraw();

            const finalBalance = await token.balanceOf(xanceObj.target);
            expect(finalBalance.toString()).to.equal('180000000000000000000');
            /*
            --account3--
            balance inicial 10
            * compra 6 del numero 3 = 6 * 0.25 = 1.5
            * compra 8 del numero 10 = 8 * 0.25 = 2
            Total de compra 3.5
            balance 6.5
            numero ganador 1003 segundo premio
            6 numeros 3 = 6 * 2 = 12
            numero ganador 1010 primer premio
            8 numeros 10 = 8 * 14 = 112
            balance final 124

            --account4--
            balance inicial 10
            compra 5 del numero 4 = 5 * 0.25 = 1.25
            * compra 4 del numero 10 = 4 * 0.25 = 1
            Total de compra 2.25
            numero ganador 1010 primer premio
            4 numeros 10 = 4 * 14 = 56
            balance 7.75

            --account5--
            balance inicial 10
            compra 4 del numero 5 = 1 * 0.25 = 1
            total de compra 1
            balance 9

            balance del contrato 500
            total en premios 12 + 113 + 56 = 180
            balance a retirar 500 - 180 = 320
            * /
        });
    }); */

});