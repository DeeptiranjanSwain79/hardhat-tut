const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");

const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyTest", () => {
  async function runEveryTime() {
    const ONE_YEAR_IN_SECONDS = 365 * 25 * 60 * 60;
    const ONE_GEWI = 1000000000;

    const lockedAmount = ONE_GEWI;
    const unlockedTime = (await time.latest()) + ONE_YEAR_IN_SECONDS;

    const [owner, otherAccount] = await ethers.getSigners();
    // console.log("owner", owner);
    // console.log("otherAccount", otherAccount);

    const MyTest = await ethers.getContractFactory("MyTest");
    const myTest = await MyTest.deploy(unlockedTime, { value: lockedAmount });

    return { myTest, unlockedTime, lockedAmount, owner, otherAccount };
  }

  describe("Deployment", () => {
    // Checking unlock time
    it("Should check unlocked time", async function () {
      const { myTest, unlockedTime } = await loadFixture(runEveryTime);

      expect(await myTest.unlockedTime()).to.equal(unlockedTime);
    });

    // Checking Owner
    it("Should set the right owner", async function () {
      const { myTest, owner } = await loadFixture(runEveryTime);
      expect(await myTest.owner()).to.equal(owner.address);
    });

    it("Should receive and store funds to myTest", async function () {
      const { myTest, lockedAmount } = await loadFixture(runEveryTime);
      //   const contractBal = await ethers.provider.getBalance(myTest.address);
      const myTestAddress = await myTest.getAddress();
      expect(await ethers.provider.getBalance(myTestAddress)).to.equal(
        lockedAmount
      );
    });

    // Condition check
    it("Should fail if the unlocked is not in the future", async function () {
      const latestTime = await time.latest();
      const MyTest = await ethers.getContractFactory("MyTest");

      await expect(MyTest.deploy(latestTime, { value: 1 })).to.be.revertedWith(
        "Your unlock time should be a future time"
      );
    });
  });

  describe("Withdrawals", () => {
    describe("Validations", () => {
      // Time for withdrawn
      it("Should revert with the right if called too soon", async function () {
        const { myTest } = await loadFixture(runEveryTime);

        await expect(myTest.withdraw()).to.be.revertedWith(
          "Wait for the time period is completed"
        );
      });

      it("Should revert the message for right owner", async function () {
        const { myTest, unlockedTime, otherAccount } = await loadFixture(
          runEveryTime
        );

        await time.increaseTo(unlockedTime);
        await expect(
          myTest.connect(otherAccount).withdraw()
        ).to.be.revertedWith("You're not the owner of this ethers");
      });

      it("Should not fail if the unlockTime has arrived and owner calls it", async function () {
        const { myTest, unlockedTime } = await loadFixture(runEveryTime);

        await time.increaseTo(unlockedTime);
        await expect(myTest.withdraw()).not.to.be.reverted;
      });
    });
  });

  //   Checking for events
  describe("EVENTS", () => {
    // Submit events
    it("Should submit event on withdrawal", async () => {
      const { myTest, unlockedTime, lockedAmount } = await loadFixture(
        runEveryTime
      );

      await time.increaseTo(unlockedTime);
      await expect(myTest.withdraw())
        .to.emit(myTest, "Withdrawl")
        .withArgs(lockedAmount, anyValue);
    });
  });

  //   Checking for transfer
  describe("Transfers", () => {
    it("Should transfer the funds to the owner", async () => {
      const { myTest, unlockedTime, lockedAmount, owner } = await loadFixture(
        runEveryTime
      );

      // Check if all necessary variables are defined
      if (!myTest || !unlockedTime || !lockedAmount || !owner) {
        throw new Error("Fixture did not return expected values");
      }

      await time.increaseTo(unlockedTime);

      await expect(myTest.withdraw()).to.changeEtherBalances(
        [owner, myTest],
        [lockedAmount, -lockedAmount]
      );
    });
  });

  runEveryTime();
});
