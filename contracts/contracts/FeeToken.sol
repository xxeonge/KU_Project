// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FeeToken is ERC20, Ownable {
    constructor(address initialOwner) ERC20("FeeToken", "FEE") Ownable(initialOwner) {}

    function mint(address to, uint256 amount) public onlyOwner {
        amount = 1000000 * (10 ** uint256(decimals()));
        _mint(to, amount);
    }
}