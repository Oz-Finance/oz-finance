// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


library UserLibrary {
    
    struct User {
        uint64 tokenPrice;                   // Price for token
        uint32 lastInvestmentTimestamp;      // Timestamp for reserving a slot  
        address referrer;                    // Address of referrer 
        uint128 investedDollars;             // Invesment less then 3500$
        bool KYC;                            // Boolean for KYC
        bool mintedOnce;                     // Boolean for minting tokens of 3500$
        uint16 bonusMatrixAllocation;        // Bonus slots
        uint64 id;                           // Citizen Count
        uint16 userType;                     // 1 => OZ Investment, 2 => OZ Core, 3 => OZ Architects, 4 => Influencer
        uint16 investmentCounter;            // Counter of investment
        uint128 investedDollarsInBonusSlots; // Invested amount in bonus slots in dollars
        uint128 soldDollarsInFlashSale;      // Worth of OZ tokens sold in dollars in flash sale
        uint256 totalTokens;                 // Total OZ tokens
    }

    function exists(User storage self) internal view returns (bool) {
        return self.id != 0;
    }
}