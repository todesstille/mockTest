const { expect } = require("chai");
const {ethers} = require('hardhat')
const {Mock} = require('@todesstille/mock');
const { getContractFactory } = require("@nomiclabs/hardhat-ethers/types");
const mock = new Mock(ethers)

describe("VRF tests", function () {
  describe("VRF", function () {
    it ('VRF', async () => {
      const amount = await ethers.utils.parseUnits("2.0", 18);
      const [admin] = await ethers.getSigners()
      link = await mock.getLinkToken();
      coordinator = await mock.getVrfV1(link.address)
      await coordinator.register("0xAA77729D3466CA35AE8D28B3BBAC7CC36A5031EFDC430821C02BC31A238AF445", "2.0")
      Rand = await ethers.getContractFactory("Random");
      rand = await Rand.deploy(coordinator.address, link.address)
      expect(await rand.lastRandomness()).to.equal(0);
      await link.transfer(rand.address, await ethers.utils.parseUnits("10.0", 18))
      await rand.random(amount);
      expect(await rand.lastRandomness()).to.equal(0);
      await coordinator.fulfill()
      expect(await rand.lastRandomness()).to.not.equal(0);
      expect(await rand.counter()).to.equal(1);
      await rand.random(amount);
      await rand.random(amount);
      await coordinator.fulfill()
      expect(await rand.counter()).to.equal(3);
    });
  });
});
