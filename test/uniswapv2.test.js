const {time} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const {ethers} = require('hardhat')
const {Mock} = require('@todesstille/mock')
const mock = new Mock(ethers)

const AddressZero = ethers.constants.AddressZero
let admin, alice, factory, token1, token2, pair
let amount1, amount2

const MINIMUM_LIQUIDITY = BigInt("1000");

async function futureTimestamp() {
  t = await time.latest();
  return t + 100;
} 

describe("Uniswap tests", function () {
  
  beforeEach(async () => {
    [admin, alice] = await ethers.getSigners()
    factory = await mock.getUniswapV2Factory(admin.address);
    token1 = await mock.getERC20("Token1", "TKN1", 18);
    token2 = await mock.getERC20("Token2", "TKN2", 18);
  })

  describe("Uniswap Factory", function () {
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
    
    it('setFeeTo', async () => {
      await expect(factory.connect(alice).setFeeTo(alice.address)).to.be.revertedWith('UniswapV2: FORBIDDEN')
      await factory.setFeeTo(alice.address)
      expect(await factory.feeTo()).to.eq(alice.address)
    })
  });
  describe("Uniswap Pair", function () {
    beforeEach(async () => {
      pair = await mock.getUniswapV2Pair(factory, token1.address, token2.address);
    })

    it('mint', async () => {
      let tokenA, tokenB      
      if (token1.address < token2.address) {
        tokenA = token1; 
        tokenB = token2
      } else {
        tokenA = token2; 
        tokenB = token1
      };
      const token0Amount = ethers.utils.parseUnits("1.0", 18);
      const token1Amount = ethers.utils.parseUnits("4.0", 18);
      await tokenA.mint(pair.address, token0Amount)
      await tokenB.mint(pair.address, token1Amount)
  
      const expectedLiquidity = ethers.utils.parseUnits("2.0", 18);
      await expect(pair.mint(alice.address, {gasLimit: 9999999}))
        .to.emit(pair, 'Transfer')
        .withArgs(AddressZero, AddressZero, MINIMUM_LIQUIDITY)
        .to.emit(pair, 'Transfer')
        .withArgs(AddressZero, alice.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
        .to.emit(pair, 'Sync')
        .withArgs(token0Amount, token1Amount)
        .to.emit(pair, 'Mint')
        .withArgs(admin.address, token0Amount, token1Amount)
  
      expect(await pair.totalSupply()).to.eq(expectedLiquidity)
      expect(await pair.balanceOf(alice.address)).to.eq(expectedLiquidity.sub(MINIMUM_LIQUIDITY))
      expect(await tokenA.balanceOf(pair.address)).to.eq(token0Amount)
      expect(await tokenB.balanceOf(pair.address)).to.eq(token1Amount)
      const reserves = await pair.getReserves()
      expect(reserves[0]).to.eq(token0Amount)
      expect(reserves[1]).to.eq(token1Amount)
    })
  })

  describe("Uniswap Router Integrity", function () {
    
    beforeEach(async () => {
      [router, factory, weth] = await mock.getUniswapV2(admin.address);
      amount1 = ethers.utils.parseUnits("1.0", 18)
      amount2 = ethers.utils.parseUnits("4.0", 18)
      await token1.mint(admin.address, amount1)
      await token2.mint(admin.address, amount2)
      await token1.approve(router.address, amount1)
      await token2.approve(router.address, amount2)
      await router.addLiquidity(token1.address, token2.address, amount1, amount2, 0, 0, admin.address, await futureTimestamp())
      pair = await mock.getUniswapV2Pair(factory, token1.address, token2.address);
    })
    it ('Could add liquidity', async () => {
      const expectedLiquidity = ethers.utils.parseUnits("2.0", 18).sub(MINIMUM_LIQUIDITY);
      expect(await pair.balanceOf(admin.address)).to.eq(expectedLiquidity)
    })

    it ('Could remove liquidity', async () => {
      const expectedLiquidity = ethers.utils.parseUnits("2.0", 18).sub(MINIMUM_LIQUIDITY);
      expect(await pair.balanceOf(admin.address)).to.eq(expectedLiquidity)
      await pair.approve(router.address, expectedLiquidity);
      await router.removeLiquidity(token1.address, token2.address, expectedLiquidity, 0, 0, alice.address, await futureTimestamp())
      expect(await token1.balanceOf(alice.address)).to.equal(BigInt("999999999999999500"))
    })
  });
});
