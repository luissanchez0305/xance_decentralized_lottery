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
    uint prize = 19*10**18;
    mapping(uint8 => uint256) public prizeAmounts;
    mapping(uint8 => uint16) public prizes;

    IERC20 public usdToken;
    uint public expiresAt;
    bool public isActive = false;
    uint256 public totalSold;
    address houseWallet;

    event Buy(address indexed buyer, uint8[] numbers, uint8[] qtys);

    constructor(address _houseWallet, address usdAddress, uint _expiresAt) {
        require(_expiresAt > block.timestamp, "Expiration date should be in the future");
        prizeAmounts[1] = 14*10**18;
        prizeAmounts[2] = 3*10**18;
        prizeAmounts[3] = 2*10**18;

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

    function getPrizeWinners(uint8 prizeType) public view isExpired returns (BuyInfo[] memory) {
        require(prizes[1] > 0, "Winning number is not set");

        uint8 winningNumber = 0;
        if(prizeType == 1){
            winningNumber = uint8(prizes[1] % 100);
        } else if(prizeType == 2){
            winningNumber = uint8(prizes[2] % 100);
        } else if(prizeType == 3){
            winningNumber = uint8(prizes[3] % 100);
        } else {
            revert("Invalid prize type");
        }

        uint256 totalSold_ = getSoldNumber(winningNumber);
        if(totalSold_ == 0) {
            return new BuyInfo[](0);
        }
        return soldNumbers[winningNumber];
    }

    function getAllPrizeNumbers() public view isExpired returns (BuyInfo[][] memory) {
        require(prizes[1] > 0, "Winning number is not set");
            
        BuyInfo[][] memory allPrizeNumbers = new BuyInfo[][](3);
        
        for(uint8 i = 1; i <= 3; i++) {
            BuyInfo[] memory response = getPrizeWinners(i);
            if(response.length == 0) continue;
            allPrizeNumbers[i - 1] = response;
        }

        return allPrizeNumbers;
    }

    function setMaxInventoryNumber() public onlyOwner {
        uint256 balance = usdToken.balanceOf(address(this));
        maxInventoryNumber = uint8(balance / prize);
        isActive = true;
    }
    
    function setPrizeNumbers(uint16[] memory _prizeNumbers) public onlyOwner isExpired {
        require(_prizeNumbers.length == 3, "There should be 3 winning numbers");
        for (uint256 i = 0; i < 3; i++) {
            require(_prizeNumbers[i] < 9999, "Winning number should be between 0 and 9999");
        }

        (prizes[1], prizes[2], prizes[3]) = (_prizeNumbers[0], _prizeNumbers[1], _prizeNumbers[2]);
    }

    function buy(uint8[] calldata numbers, uint8[] calldata qtys) public isLotteryActive {
        require(numbers.length > 0, "You should buy at least one number");
        require(numbers.length == qtys.length, "Numbers and quantities should have the same length");
        require(block.timestamp < expiresAt, "You can't buy after the expiration date");

        uint256 totalAmount = 0;

        for (uint256 i = 0; i < numbers.length; i++) {
            uint8 number = numbers[i];
            require(number < 100, "Number should be between 0 and 99");

            BuyInfo[] memory boughtNumbers = getSoldNumbers(number);
            uint256 totalSoldNumber = 0;
            for (uint256 j = 0; j < boughtNumbers.length; j++) {
                totalSoldNumber += boughtNumbers[j].qty;
            }

            uint256 totalQty = qtys[i] + totalSoldNumber;
            require(totalQty < maxInventoryNumber, "Number is sold out");

            soldNumbers[number].push(BuyInfo(number, msg.sender, qtys[i]));
            totalAmount += qtys[i] * unitPrice;
        }

        require(usdToken.balanceOf(msg.sender) >= totalAmount, "You don't have enough USD tokens");
        usdToken.safeTransferFrom(msg.sender, address(this), totalAmount);

        totalSold += totalAmount;
        emit Buy(msg.sender, numbers, qtys);
    }

    function claim() public isExpired isLotteryActive {
        require(prizes[1] > 0, "Winning numbers are not set");

        uint8 fpNumber = uint8(prizes[1] % 100);
        uint8 spNumber = uint8(prizes[2] % 100);
        uint8 tpNumber = uint8(prizes[3] % 100);

        uint8 fpPosition = getPosition(fpNumber);
        uint8 spPosition = getPosition(spNumber);
        uint8 tpPosition = getPosition(tpNumber);

        require(fpPosition > 0 || spPosition > 0 || tpPosition > 0, "You don't have a winning number");

        uint256 amount = calculateAndDelete(1, fpPosition, fpNumber) +
                        calculateAndDelete(2, spPosition, spNumber) +
                        calculateAndDelete(3, tpPosition, tpNumber);

        usdToken.safeTransfer(msg.sender, amount);
    }

    function getPosition(uint8 _number) private view returns (uint8) {
        for (uint8 i = 0; i < soldNumbers[_number].length; i++) {
            if (soldNumbers[_number][i].addr == msg.sender) {
                return i + 1;
            }
        }
        return 0;
    }

    function calculateAndDelete(uint8 prizePosition, uint8 _position, uint8 _number) private returns (uint256) {
        if (_position == 0) {
            return 0;
        }
        uint256 totalSold_ = getSoldNumbersByAddress(_number, msg.sender);
        uint256 _prize = prizeAmounts[prizePosition];
        delete soldNumbers[_number][_position - 1];
        return _prize * totalSold_;
    }

    function withdraw() public onlyOwner isExpired {
        uint256 houseCut = totalSold * 30 / 100;
        usdToken.safeTransfer(houseWallet, houseCut);

        uint256 balance = usdToken.balanceOf(address(this));
        BuyInfo[] memory fpWinners = getPrizeWinners(1);
        
        for(uint256 i = 0; i < fpWinners.length; i++) {
            uint256 amount = prizeAmounts[1] * fpWinners[i].qty;
            balance -= amount;
        }

        BuyInfo[] memory spWinners = getPrizeWinners(2);
        
        for(uint256 i = 0; i < spWinners.length; i++) {
            uint256 amount = prizeAmounts[2] * spWinners[i].qty;
            balance -= amount;
        }

        BuyInfo[] memory tpWinners = getPrizeWinners(3);
        
        for(uint256 i = 0; i < tpWinners.length; i++) {
            uint256 amount = prizeAmounts[3] * tpWinners[i].qty;
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