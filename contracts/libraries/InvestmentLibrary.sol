// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


library InvestmentLibrary {

  struct cycles {
    uint64 time;                     // Timestamp of investment
    uint64 tokens;                   // Tokens for investment
    uint128 totalTokensWithdrawn ;   // Tokens withdrawan
  } 

}   