const { expect } = require("chai");
const {ethers} = require('hardhat')
const {Mock} = require('@todesstille/mock');
const { getContractFactory } = require("@nomiclabs/hardhat-ethers/types");
const mock = new Mock(ethers)
let admin, alice, bob
let comp

describe("Compound v2 tests", function () {
  
    beforeEach(async () => {
        [admin, alice, bob] = await ethers.getSigners()
        comp = await mock.getCompoundV2();
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
  });
});
