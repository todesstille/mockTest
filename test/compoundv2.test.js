const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const {ethers} = require('hardhat')
const {Mock} = require('@todesstille/mock');
const { getContractFactory } = require("@nomiclabs/hardhat-ethers/types");
const mock = new Mock(ethers)
const abiCoder = new ethers.utils.AbiCoder()
let admin, alice, bob
let comp, timelock

describe("Compound v2 tests", function () {
  
    beforeEach(async () => {
        [admin, alice, bob] = await ethers.getSigners()
        comp = await mock.createCompoundV2();
        timelock = comp.timelock;
      })
    describe("Timelock", function () {
        it ('Correct admin and delay', async () => {
            expect(await timelock.admin()).to.equal(admin.address);
            expect(await timelock.delay()).to.equal(172800);
        });
        it ('Cant set delay even by owner', async () => {
            await expect(timelock.setDelay(173000))
                .to.be.revertedWith("Timelock::setDelay: Call must come from Timelock.")
        });

        it ("Can set admin", async () => {
            expect(await timelock.admin()).to.equal(admin.address);
            let sendTime = await time.latest() + 210000;
            await timelock.queueTransaction(timelock.address, 0, "setPendingAdmin(address)", abiCoder.encode(["address"], [alice.address]), sendTime);
            await time.increaseTo(sendTime + 1000)
            await timelock.executeTransaction(timelock.address, 0, "setPendingAdmin(address)", abiCoder.encode(["address"], [alice.address]), sendTime);
            await expect(timelock.connect(bob).acceptAdmin())
                .to.be.revertedWith("Timelock::acceptAdmin: Call must come from pendingAdmin.");
            await timelock.connect(alice).acceptAdmin();
            expect(await timelock.admin()).to.equal(alice.address);
        });
        it ("New package", async () => {
            let compound = await mock.createCompoundV2()
            let cEther = await compound.getCEther();
            expect(await cEther.symbol()). to.equal("cEth")
            expect(await cEther.isCToken()).to.equal(true);
            let usdc = await mock.getERC20("USD Coin", "USDC", 6);
            let cUsdc = await compound.getCToken(usdc)
            expect(await cUsdc.isCToken()).to.equal(true);
            expect(await cUsdc.symbol()). to.equal("cUSDC")
            expect(await cUsdc.name()). to.equal("Compound USD Coin")
        });
        it ("", async () => {});
        it ("", async () => {});
  });
});
