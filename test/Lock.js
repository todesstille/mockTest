const { expect } = require("chai");
const {ethers} = require('hardhat')
const {Mock} = require('@todesstille/mock')
const mock = new Mock(ethers)

describe("Mock Library tests", function () {
  describe("ERC20", function () {
    it ('Test ERC20', async () => {
      const [admin] = await ethers.getSigners()
      erc20 = await mock.getERC20("Token", "TKN", 18);
      await erc20.mint(admin.address, 1);
      expect(await erc20.balanceOf(admin.address)).to.equal(1)
    });
  });

  describe("Chainlink Price Feed", function () {
    it ("Chainlink Pricefeed V2V3", async () => {
      const [admin] = await ethers.getSigners()
      oracle = await mock.getChainlinkPricefeed(8, "USDT/USD", 1, 100000000)
      expect(await oracle.latestRound()).to.equal(1)
      expect(await oracle.latestAnswer()).to.equal(BigInt("100000000"))
    })
  });

  describe("Uniswap", function () {
    it ('Uniswap factory and pair', async () => {
      const [admin] = await ethers.getSigners()
      factory = await mock.getUniswapV2(admin.address);
      token1 = await mock.getERC20("Token1", "TKN1", 18);
      token2 = await mock.getERC20("Token2", "TKN2", 18);
      pair = await mock.getUniswapV2Pair(factory, token1.address, token2.address)
      expect(await pair.balanceOf(admin.address)).to.equal(0)
      await token1.mint(pair.address, ethers.utils.parseUnits("100.0", 18))
      await token2.mint(pair.address, ethers.utils.parseUnits("1000.0", 18))
      await pair.mint(admin.address);

      expect(await pair.balanceOf(admin.address)).to.equal(BigInt("316227766016837932199"))
    });
  });
});
