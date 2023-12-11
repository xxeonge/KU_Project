const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Membership Contract', function () {
  let Membership;
  let membership;
  let owner;
  let user;
  let feeToken;

 
  it('init', async function () {
    [owner, user] = await ethers.getSigners();
    feeToken = await (await ethers.getContractFactory('FeeToken')).deploy(owner.address);   
    membership = await (await ethers.getContractFactory('membership')).deploy(await feeToken.getAddress());
  
    //  function mint(address to, uint256 amount) public onlyOwner
    await feeToken.mint(user.address, 100000);
    
  });

  it('Should register user and authenticate', async function () {
    const hashedPassword = ethers.keccak256(ethers.encodeBytes32String('password'));
    
    // Register user
    await membership.connect(user).registerUser(hashedPassword);

    const isUserRegistered = await membership.connect(user).checkUser();
    expect(isUserRegistered).to.be.true;

    // Authenticate user
    const isAuthenticated = await membership.connect(user).authenticateUser(ethers.encodeBytes32String('password'));
    expect(isAuthenticated).to.be.true;
  });

  it('Should record entry and exit timestamps', async function () {
    // Record entry timestamp
    await membership.connect(user).getEntryTimestamp(); // 입차 시간
    const entryTimestamp = await membership.connect(user).getEntry();
    expect(entryTimestamp).to.not.equal(0);
  });

  it('Should calculate and pay exit fee', async function () {
    const initialBalance = await feeToken.balanceOf(user.address);
    const parkingDuration = 4 * 60 * 60; // 4 hours

    // Record entry timestamp
    await membership.connect(user).getEntryTimestamp();

    // Increase time to simulate parking duration
    await ethers.provider.send('evm_increaseTime', [parkingDuration]);

    // Record exit timestamp and pay exit fee
    await feeToken.connect(user).approve(await membership.getAddress(),ethers.parseEther(initialBalance.toString()));
    await membership.connect(user).exitFee();

    const finalBalance = await feeToken.balanceOf(user.address);

    const expectedFee = ((parkingDuration - (3 * 3600)) / 600 * 1000);
    
    expect(initialBalance).to.equal(finalBalance + ethers.parseEther(expectedFee.toString()));
  });
});
