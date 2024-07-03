const hre = require("hardhat");
const ethers = require("ethers");

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
  const unlockedTime = currentTimestampInSeconds + ONE_YEAR_IN_SECONDS;

  // console.log(currentTimestampInSeconds);
  // console.log(ONE_YEAR_IN_SECONDS);
  // console.log(unlockedTime);

  const lockedAmount = ethers.parseEther("1");

  const MyTest = await hre.ethers.getContractFactory("MyTest");
  const myTest = await MyTest.deploy(unlockedTime, { value: lockedAmount });
  const address = await myTest.getAddress();

  console.log(`Contract contains 1 ETH & address: ${address}`);
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});
