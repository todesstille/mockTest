const { expect } = require("chai");
const {ethers} = require('hardhat')
const {Mock} = require('@todesstille/mock')
const mock = new Mock(ethers)

let admin, alice, bob, weth
const eth1 = ethers.utils.parseEther("0.1");

describe("WETH9", function () {
  describe("WETH9", function () {

    beforeEach(async () => {
        weth = await mock.getWeth9();
        [admin, alice, bob] = await ethers.getSigners()
      })

    it ('Could deposit via deposit()', async () => {     
      expect(await weth.balanceOf(admin.address)).to.equal(0)
      await weth.deposit({value: eth1});
      expect(await weth.balanceOf(admin.address)).to.equal(eth1)
    });

    it ('Could deposit via transaction', async () => {
        expect(await weth.balanceOf(admin.address)).to.equal(0)
        await admin.sendTransaction({to: weth.address, value: eth1})
        expect(await weth.balanceOf(admin.address)).to.equal(eth1)
    });

    it ('Could transfer', async () => {
        await admin.sendTransaction({to: weth.address, value: eth1})
        await weth.transfer(alice.address, eth1)
        expect(await weth.balanceOf(alice.address)).to.equal(eth1)
    });
    
    it ('Could withdraw after transfer', async () => {
        await admin.sendTransaction({to: weth.address, value: eth1})
        await weth.transfer(alice.address, eth1)
        await expect(weth.connect(alice).withdraw(eth1))
            .to.changeEtherBalances([alice, weth], [(+eth1).toString(), (-eth1).toString()], {includeFee: false});
    });

    it ('Cant transferFrom without approve', async () => {
        await admin.sendTransaction({to: weth.address, value: eth1})
        await expect(weth.connect(alice).transferFrom(admin.address, alice.address, eth1))
            .to.be.reverted
    });

    it ('Could transferFrom with approve', async () => {
        await admin.sendTransaction({to: weth.address, value: eth1})
        await weth.approve(alice.address, eth1)
        await weth.connect(alice).transferFrom(admin.address, bob.address, eth1);
        expect (await weth.balanceOf(bob.address)).to.equal(eth1)
    });
  });
});
