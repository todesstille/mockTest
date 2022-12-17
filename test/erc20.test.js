const { expect } = require("chai");
const {ethers} = require('hardhat')
const {Mock} = require('@todesstille/mock')
const mock = new Mock(ethers)

describe("ERC20 tests", function () {
  describe("ERC20", function () {
    it ('Test ERC20', async () => {
      const [admin] = await ethers.getSigners()
      erc20 = await mock.getERC20("Token", "TKN", 18);
      await erc20.mint(admin.address, 1);
      expect(await erc20.balanceOf(admin.address)).to.equal(1)
    });
  });
});
