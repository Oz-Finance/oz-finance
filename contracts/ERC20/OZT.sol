// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;



import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract OZT is ERC20 {

    constructor (string memory tokenName, string memory tokenSymbol) ERC20(tokenName, tokenSymbol) {
        _mint(msg.sender, uint(0));
        
    }

    function burn(uint256 amount) public returns (bool) {
        _burn(msg.sender, amount);
        return true;
    }

    function mint(address account,uint256 amount)public  returns(bool){
        _mint(account,amount);
        return true;
    }
     
    function decimals() public view virtual override returns (uint8) {
        return 8;
    }
}   


