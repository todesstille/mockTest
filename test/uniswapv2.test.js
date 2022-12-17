const { expect } = require("chai");
const {ethers} = require('hardhat')
const {Mock} = require('@todesstille/mock')
const mock = new Mock(ethers)

const AddressZero = ethers.constants.AddressZero
let admin, alice, factory, token1, token2

describe("Uniswap tests", function () {
  
  beforeEach(async () => {
    [admin, alice] = await ethers.getSigners()
    factory = await mock.getUniswapV2(admin.address);
    token1 = await mock.getERC20("Token1", "TKN1", 18);
    token2 = await mock.getERC20("Token2", "TKN2", 18);
  })

  describe("Uniswap", function () {
    it ('Uniswap factory and pair', async () => {
      pair = await mock.getUniswapV2Pair(factory, token1.address, token2.address)
      expect(await pair.balanceOf(admin.address)).to.equal(0)
      await token1.mint(pair.address, ethers.utils.parseUnits("100.0", 18))
      await token2.mint(pair.address, ethers.utils.parseUnits("1000.0", 18))
      await pair.mint(admin.address);

      expect(await pair.balanceOf(admin.address)).to.equal(BigInt("316227766016837932199"))
    });

    it('feeTo, feeToSetter, allPairsLength', async () => {
      expect(await factory.feeTo()).to.eq(AddressZero)
      expect(await factory.feeToSetter()).to.eq(admin.address)
      expect(await factory.allPairsLength()).to.eq(0)
    })

    it('create pair', async () => {
      pairAddress = await factory.callStatic.createPair(token1.address, token2.address)
      if (token1.address < token2.address) {
        tokenA = token1.address; 
        tokenB = token2.address
      } else {
        tokenA = token2.address; 
        tokenB = token1.address
      };
      await expect(factory.createPair(token1.address, token2.address))
        .to.emit(factory, 'PairCreated')
        .withArgs(tokenA, tokenB, pairAddress, 1)
      
      await expect(factory.createPair(token2.address, token1.address))
        .to.be.revertedWith("UniswapV2: PAIR_EXISTS");

      expect(await factory.getPair(token1.address, token2.address)).to.eq(pairAddress)
      expect(await factory.getPair(token2.address, token1.address)).to.eq(pairAddress)
      expect(await factory.allPairs(0)).to.eq(pairAddress)
      expect(await factory.allPairsLength()).to.eq(1)
    })
    
    it ("pair data correct", async () => {
      pair = await mock.getUniswapV2Pair(factory, token1.address, token2.address);
      if (token1.address < token2.address) {
        tokenA = token1.address; 
        tokenB = token2.address
      } else {
        tokenA = token2.address; 
        tokenB = token1.address
      };
      expect(await pair.factory()).to.eq(factory.address)
      expect(await pair.token0()).to.eq(tokenA)
      expect(await pair.token1()).to.eq(tokenB)
    })
    
    it('createPair:gas', async () => {
      const tx = await factory.createPair(token1.address, token2.address)
      const receipt = await tx.wait()
      expect(receipt.gasUsed).to.eq(2512920)
    })

    it('setFeeTo', async () => {
      await expect(factory.connect(alice).setFeeTo(alice.address)).to.be.revertedWith('UniswapV2: FORBIDDEN')
      await factory.setFeeTo(alice.address)
      expect(await factory.feeTo()).to.eq(alice.address)
    })
  });
});
