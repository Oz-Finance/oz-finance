//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface OZV0Events {
    event Registration(
        address indexed userAddress,
        address indexed referrerAddress,
        uint256 userId,
        uint256 referrerId,
        uint256 time,
        bool isKYC
    );
    event PurchaseTokens(
        address indexed userAddress,
        uint256 tokens,
        uint32 investmentCounter,
        uint256 time,
        bool isReserved,
        uint256 tokenPrice,
        uint256 investedDollars,
        bool sellOnCurrentPrice,
        uint256 decimalFactor,
        uint256 currentPrice
    );
    event ReffralIncome(
        address user,
        address reffralAddress,
        uint256 reffralIncome,
        uint256 ozOperationIncome,
        uint256 decimalFactor,
        uint256 time
    );
    event DripWithdrawal(
        address user,
        uint32 investmentCounter,
        uint256 tokens,
        uint256 time
    );
    event BonusAllocation(
        address user,
        uint256 price,
        uint256 token,
        uint256 time,
        uint256 investment,
        uint256 decimalFactor,
        uint256 investmentCounter
    );
    event FlashSale(
        address seller,
        address buyer,
        uint256 price,
        uint256 token,
        uint256 time,
        uint256 value,
        uint256 decimals,
        uint256 investmentCounter
    );
    event SellToken(
        address buyer,
        uint256 tokens,
        uint256 price,
        uint256 time,
        uint256 investmentCounter,
        uint256 currentPrice
    );

    event SlotReservedByAdmin(
        address user,
        uint256 userType,
        uint256 price,
        uint256 timeStamp,
        uint256 blockNumber
    );
}
