const { expect } = require("chai");
const {ethers} = require('hardhat')
const {Mock} = require('@todesstille/mock')
const mock = new Mock(ethers)

describe("Chainlink Price Feed", function () {
  describe("Chainlink Price Feed", function () {
    it ("Chainlink Pricefeed V2V3", async () => {
      const [admin] = await ethers.getSigners()
      oracle = await mock.getChainlinkPricefeed(8, "USDT/USD", 1, 100000000)
      expect(await oracle.latestRound()).to.equal(1)
      expect(await oracle.latestAnswer()).to.equal(BigInt("100000000"))
    })
  });
});
