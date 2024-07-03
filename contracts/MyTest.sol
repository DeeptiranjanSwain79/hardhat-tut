// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.24;

import "hardhat/console.sol";

contract MyTest {
    uint256 public unlockedTime;
    address payable public owner;

    event Withdrawl(uint256 amount, uint256 when);

    constructor(uint256 _unlockedTime) payable {
        require(
            block.timestamp < _unlockedTime,
            "Your unlock time should be a future time"
        );

        unlockedTime = _unlockedTime;
        owner = payable(msg.sender);
    }

    function withdraw() public {
        require(
            block.timestamp >= unlockedTime,
            "Wait for the time period is completed"
        );
        require(msg.sender == owner, "You're not the owner of this ethers");

        emit Withdrawl(address(this).balance, block.timestamp);
        owner.transfer(address(this).balance);
    }
}
