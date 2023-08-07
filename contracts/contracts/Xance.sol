// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Xance is Ownable {
    using SafeERC20 for IERC20;
    struct BuyInfo {
        uint8 number;
        address addr;
        uint8 qty;
    }
    mapping (uint8 => BuyInfo[]) public soldNumbers;

    uint8 public maxInventoryNumber;
    uint unitPrice = 25 * 10 ** 16;
    uint prize = 14*10**18;

    IERC20 public usdToken;
    uint public expiresAt;
    uint16 firstPrize;
    bool public isActive = false;
    uint256 public totalSold;
    address houseWallet;

    event Buy(address indexed buyer, uint8[] numbers, uint8[] qtys);

    constructor(address _houseWallet, address usdAddress, uint _expiresAt) {
        require(_expiresAt > block.timestamp, "Expiration date should be in the future");

        houseWallet = _houseWallet;
        usdToken = IERC20(usdAddress);
        expiresAt = _expiresAt;
    }

    function getSoldNumber(uint8 number) public view returns (uint256) {
        return soldNumbers[number].length;
    }

    function getSoldNumbers(uint8 number) public view returns (BuyInfo[] memory) {
        return soldNumbers[number];
    }

    function getSoldNumbersByAddress(uint8 number, address addr) public view returns (uint8) {
        uint8 count = 0;
        for(uint256 i = 0; i < soldNumbers[number].length; i++) {
            if(soldNumbers[number][i].addr == addr) {
                count += soldNumbers[number][i].qty;
            }
        }

        return count;
    }

    function getAllSoldNumbers() public view returns (BuyInfo[] memory) {
        uint256 total = 0;
        for(uint8 i = 0; i < 100; i++) {
            total += soldNumbers[i].length;
        }

        BuyInfo[] memory allSoldNumbers = new BuyInfo[](total);
        uint256 index = 0;
        for(uint8 i = 0; i < 100; i++) {
            if(soldNumbers[i].length == 0) continue;
            
            for(uint256 j = 0; j < soldNumbers[i].length; j++) {
                allSoldNumbers[index] = soldNumbers[i][j];
                index++;
            }
        }

        return allSoldNumbers;
    }

    function getWinners() public view isExpired returns (BuyInfo[] memory) {
        require(firstPrize > 0, "Winning number is not set");

        uint8 winningNumber = uint8(firstPrize % 100);

        uint256 totalSold_ = getSoldNumber(winningNumber);
        require(totalSold_ > 0, "Winning number was not sold");
        return soldNumbers[winningNumber];
    }

    function setMaxInventoryNumber() public onlyOwner {
        uint256 balance = usdToken.balanceOf(address(this));
        maxInventoryNumber = uint8(balance / 14 ether);
        isActive = true;
    }

    function setFirstPrize(uint16 _firstPrize) public onlyOwner isExpired {
        require(_firstPrize < 9999, "Winning number should be between 0 and 9999");

        firstPrize = _firstPrize;
    }

    function buy(uint8[] calldata numbers, uint8[] calldata qtys) public isLotteryActive{
        require(numbers.length > 0, "You should buy at least one number");
        require(numbers.length == qtys.length, "Numbers and quantities should have the same length");
        require(block.timestamp < expiresAt, "You can't buy after the expiration date");
        // require(numbers.length <= 10, "You can't buy more than 10 numbers at once");

        uint8 total = 0;

        for(uint8 i = 0; i < numbers.length; i++) {
            uint8 number = numbers[i];
            uint totalSoldNumber = 0;
            BuyInfo[] memory boughtNumbers = getSoldNumbers(number);
            for(uint256 j = 0; j < boughtNumbers.length; j++) {
                totalSoldNumber += boughtNumbers[j].qty;
            }
            require(qtys[i] + totalSoldNumber < maxInventoryNumber, "Number is sold out");
            require(number >= 0 && number < 100, "Number should be between 0 and 99");
            total += qtys[i];

            soldNumbers[number].push(BuyInfo(number, msg.sender, qtys[i]));
        }

        uint256 totalAmount = total * unitPrice;
        require(usdToken.balanceOf(msg.sender) >= totalAmount, "You don't have enough USD tokens");

        usdToken.safeTransferFrom(msg.sender, address(this), totalAmount);
        totalSold += totalAmount;
        emit Buy(msg.sender, numbers, qtys);
    }

    function claim() public isExpired isLotteryActive {
        require(firstPrize > 0, "Winning number is not set");
        uint8 number = uint8(firstPrize % 100);

        uint256 position = 0;
        for(uint256 i = 0; i < soldNumbers[number].length; i++) {
            if(soldNumbers[number][i].addr == msg.sender) {
                position = i + 1;
                break;
            }
        }

        require(position >= 1, "You don't have a winning number");

        uint256 totalSold_ = getSoldNumbersByAddress(number, msg.sender);
        uint256 amount = prize * totalSold_;
        usdToken.safeTransfer(msg.sender, amount);
        delete soldNumbers[number][position - 1];
    }

    function withdraw() public onlyOwner isExpired {
        uint256 houseCut = totalSold * 20 / 100;
        usdToken.safeTransfer(houseWallet, houseCut);

        uint256 balance = usdToken.balanceOf(address(this));
        BuyInfo[] memory winners = getWinners();
        
        for(uint256 i = 0; i < winners.length; i++) {
            uint256 amount = prize * winners[i].qty;
            balance -= amount;
        }
        usdToken.safeTransfer(msg.sender, balance);
    }

    modifier isExpired() {
        require(block.timestamp > expiresAt, "You can't do this before the expiration date");
        _;
    }

    modifier isLotteryActive() {
        require(isActive, "Loterry contract is not active");
        _;
    }
}