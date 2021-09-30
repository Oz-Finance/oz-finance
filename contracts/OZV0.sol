// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "contracts/interfaces/IERC20.sol";
import "contracts/interfaces/OZT_Interface.sol";
import "contracts/interfaces/OZV0Events.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "contracts/libraries/UserLibrary.sol";
import "contracts/libraries/InvestmentLibrary.sol";
import "contracts/libraries/TransferHelper.sol";
import "hardhat/console.sol";

/**
 *  @title OZV0
 *  @dev This contract combines an upgradeability proxy with basic authorization control functionalities
 */

contract OZV0 is OZV0Events, Ownable, ReentrancyGuard {
    using UserLibrary for UserLibrary.User;
    using InvestmentLibrary for InvestmentLibrary.cycles;
    IERC20 paymentToken;
    OZT_Interface OZT;

    uint256 public DAYS_IN_SECONDS; // Seconds in a day
    uint256 public tokenCounter; // Number of tokens added by admin
    uint256 public bonuspercentage; // Sell percentage cost of bonus token
    address public rootNode; // Owner of OZV0
    address public ozOperations; // Address of OZ operation
    uint256 internal currentId; // Current ID
    uint256 internal soldInDollars; // Worth of sold OZ token in dollars
    uint256 internal publicSaleInDollars; // Total worth of sold OZ token in dollars in public domain
    uint256 internal privateSaleInDollars; // Total worth of sold OZ token in dollars in private domain

    uint256 internal constant dollarDecimals = 1000000000000; // Decimal Factor for dollar
    uint256 internal constant maxInvestmentCap = 3500 * dollarDecimals; // Slot prize in dollar
    uint256[] internal startingPrice; // Starting Price in each category
    uint256[] internal counters; // Slot Counters
    uint256[] internal limitInSlot; // Slot Limit
    bool internal _initialized; // Boolean to protect initialize function

    mapping(address => UserLibrary.User) public users; // Address to user mapping
    mapping(address => bool) public tokenIsRegistered; // Boolean to check if any token is registered
    mapping(address => mapping(uint64 => InvestmentLibrary.cycles))
        public investment; // Address to investment mapping
    mapping(uint256 => address) public idToAddress; // ID to address mapping
    mapping(uint256 => address) public tokenAddresses; // Counter to token address mapping

    /***
     *  @dev Initialize function  used to initiate variables
     *  @param _root address that is to be the owner address
     *  @param ozTokenAddress is the address of OZ token contract address
     *  @param ozTokenAddress address  is the OZ operations address
     */

    function initialize(
        address _root,
        address ozTokenAddress,
        address _ozOperations
    ) external {
        require(!_initialized, "OZV0: INVALID");
        _initialized = true;
        rootNode = _root;
        currentId = 1;
        DAYS_IN_SECONDS = 10;
        OZT = OZT_Interface(ozTokenAddress);
        startingPrice = [8, 16, 80, 720];
        counters = [0, 0, 0, 0];
        limitInSlot = [1, 8, 80, 800];
        ozOperations = _ozOperations;
        publicSaleInDollars = 3500000 * dollarDecimals;
        privateSaleInDollars = maxInvestmentCap;
        saveDetailsOfUser(address(0), _root, true);
        users[_root].KYC = true;
        emit PurchaseTokens(
            address(0),
            0,
            0,
            block.timestamp,
            false,
            8000,
            0,
            false,
            0,
            8000
        );
    }

    /***
     *  @dev Modifier to protect functions that are only accessible for owner
     */

    modifier onlyOwnerAccess() {
        require(_msgSender() == rootNode, "OZV0: Only owner has the access");
        _;
    }

    /**
     *  @dev Used to complete the KYC of user
     *  @param _referrer is the  address of referrer
     *  @param user is the  address of user, whose KYC has to be completed
     */

    function completeKYC(
        address _referrer,
        address user,
        bool check
    ) public onlyOwnerAccess {
        require(!users[user].KYC, "OZV0:User has already done KYC");
        require(users[_referrer].exists(), "OZV0:Referrer does not exists");
        users[user].KYC = true;

        if (users[user].referrer == address(0)) {
            saveDetailsOfUser(_referrer, user, check);
        }
    }

    /*
     *  @dev Used to complete the KYC of user
     *  @param percent for selling bonus slot
     */

    function changeBonusPercentage(uint256 percent) public onlyOwnerAccess {
        bonuspercentage = percent;
    }

    /***
     *  @dev Used to add token in the contract
     *  @param tokenAddress is the token address that is to be registerd in contract
     */

    function addToken(address tokenAddress) public onlyOwnerAccess {
        // Sanity check tor token
        require(
            !(tokenIsRegistered[tokenAddress]),
            "OZV0:Token already exists"
        );
        tokenIsRegistered[tokenAddress] = true;
        tokenAddresses[tokenCounter] = tokenAddress;
        tokenCounter++;
    }

    /***
     *  @dev Used to reserve the slot for user by admin
     *  @param user is the user address, for whom slot is to be reserved
     *  @param index indicator for OZ Investment => 0, OZ Core => 1, OZ Architects => 2, OZ Influencer => 3
     */

    function slotReservedByAdmin(address user, uint256 index)
        public
        onlyOwnerAccess
        nonReentrant
    {
        require(users[user].id == 0, "OZV0 : User does not exists");
        require(
            (privateSaleInDollars <= maxInvestmentCap * 999),
            "OZV0: Private sell end"
        );
        require(
            counters[index] < limitInSlot[index],
            "OZV0 : Slots already sold"
        );
        completeKYC(rootNode, user, false);
        counters[index]++;
        users[user].tokenPrice = uint64(
            startingPrice[index] + ((counters[index] - 1) * 8)
        );
        users[user].userType = uint16(index);
        users[user].lastInvestmentTimestamp = uint32(block.timestamp);
        users[user].mintedOnce = true;
        privateSaleInDollars += maxInvestmentCap;
        emit SlotReservedByAdmin(
            user,
            users[user].userType,
            users[user].tokenPrice,
            block.timestamp,
            counters[index]
        );
    }

    /***
     *  @dev Used to get the current price of OZ token
     *  @param _publicSaleInDollars is the citizen count, on which OZ token price is required
     */

    function _currentTokenPrice(uint256 _publicSaleInDollars)
        public
        pure
        returns (uint256 price)
    {
        return (8 + ((_publicSaleInDollars / maxInvestmentCap) - 1) * 8);
    }

    /**
     *  @dev Used to get the current price of OZ token
     */

    function currentTokenPrice() public view returns (uint256 price) {
        return _currentTokenPrice(publicSaleInDollars);
    }

    /***
     *  @dev Used to purchase tokens
     *  @param value is the amount of dollars
     *  @param tokenAddress is the address of token
     *  @param _referrer the address of referrer
     */

    function purchaseTokens(
        uint128 value,
        address tokenAddress,
        address _referrer
    ) public nonReentrant {
        _referrer = _referrer == address(0) ? rootNode : _referrer;
        require(
            (tokenIsRegistered[tokenAddress]),
            "OZV0:Token is not  registered"
        );
        paymentToken = IERC20(tokenAddress);
        uint256 paymentTokenDecimals = 10**paymentToken.decimals();

        //Check for maximum and minimum investment
        if (value >= (maxInvestmentCap * paymentTokenDecimals)) {
            require(
                ((value) % (maxInvestmentCap * paymentTokenDecimals) ==
                    uint256(0)),
                "OZV0 : Investment should be in multiple of 3500 dollars"
            );
        } else if (users[_msgSender()].lastInvestmentTimestamp == uint256(0)) {
            require(
                (value >= 100 * paymentTokenDecimals * dollarDecimals),
                "OZV0: Investment less then 100$ and multiple of 100$ is allowed"
            );
        }

        if (
            (!(users[_msgSender()].KYC) &&
                (users[_msgSender()].investmentCounter == uint32(0)))
        ) {
            require(users[_referrer].exists(), "OZV0:Referrer does not exists");
            saveDetailsOfUser(_referrer, _msgSender(), true);
        }

        bool referralBonusExists;

        if (
            users[_msgSender()].KYC &&
            users[_referrer].KYC &&
            users[_msgSender()].investmentCounter == uint32(0) &&
            (users[_referrer].investmentCounter >= uint32(1))
        ) {
            users[_referrer].bonusMatrixAllocation++;
            referralBonusExists = true;
        }

        TransferHelper.safeTransferFrom(
            tokenAddress,
            _msgSender(),
            address(this),
            value / dollarDecimals
        );

        if (users[_msgSender()].investmentCounter == uint32(0)) {
            reffralBonus(
                value,
                paymentTokenDecimals,
                _referrer,
                _msgSender(),
                tokenAddress,
                referralBonusExists
            );
        }

        value < maxInvestmentCap * paymentTokenDecimals
            ? invest(value, paymentTokenDecimals, _msgSender())
            : _reserveSlot(value, paymentTokenDecimals, _msgSender());
    }

    /**
     *  @dev Used to purchase tokens in flashsale
     *  @param user is address of seller
     *  @param tokenAddress is address of token
     *  @param value is amount of dollars
     */

    function flashSale(
        address user,
        address tokenAddress,
        uint128 value
    ) public nonReentrant {
        require((users[_msgSender()].KYC), "OZV0 : Only allowed for KYC user");
        require(
            (users[user].lastInvestmentTimestamp != uint64(0)) &&
                ((block.timestamp - users[user].lastInvestmentTimestamp) /
                    DAYS_IN_SECONDS >
                    30),
            "OZV0 : Invalid purchase in flash sale"
        );
        require(
            maxInvestmentCap - users[user].investedDollars >
                users[user].soldDollarsInFlashSale,
            "OZV0 : Tokens already sold"
        );
        require(
            (tokenIsRegistered[tokenAddress]),
            "OZV0:Token is not  registered"
        );
        paymentToken = IERC20(tokenAddress);
        uint256 paymentTokenDecimals = 10**paymentToken.decimals();
        require(
            (value / paymentTokenDecimals ==
                (maxInvestmentCap - users[user].investedDollars)),
            "OZV0: Invalid investment in flash sale"
        );
        TransferHelper.safeTransferFrom(
            tokenAddress,
            _msgSender(),
            address(this),
            value / dollarDecimals
        );
        uint256 _tokens;
        users[user].soldDollarsInFlashSale +=
            value /
            uint128(paymentTokenDecimals);
        _tokens =
            (value * 1000 * 10**(OZT.decimals())) /
            ((
                users[user].tokenPrice == uint64(0)
                    ? currentTokenPrice()
                    : users[user].tokenPrice
            ) *
                paymentTokenDecimals *
                dollarDecimals);
        saveInvestmentDetails(_msgSender(), _tokens, maxInvestmentCap, true);
        emit FlashSale(
            user,
            _msgSender(),
            (
                users[user].tokenPrice == uint64(0)
                    ? currentTokenPrice()
                    : users[user].tokenPrice
            ),
            _tokens,
            block.timestamp,
            value,
            paymentTokenDecimals,
            users[_msgSender()].investmentCounter
        );
    }

    /**
     *  @dev Used to purchase bonus tokens
     *  @param value is amount of dollars
     *  @param tokenAddress is address of token
     */

    function purchaseOZBonusTokens(uint128 value, address tokenAddress)
        public
        nonReentrant
    {
        require(
            users[_msgSender()].bonusMatrixAllocation > uint16(0),
            "OZV0: No bonus allocation yet"
        );
        require(
            (tokenIsRegistered[tokenAddress]),
            "OZV0:Token is not  registered"
        );

        paymentToken = IERC20(tokenAddress);
        uint256 paymentTokenDecimals = 10**paymentToken.decimals();
        require(
            users[_msgSender()].investedDollarsInBonusSlots +
                (value / paymentTokenDecimals) <=
                (users[_msgSender()].bonusMatrixAllocation) * maxInvestmentCap,
            "OZV0: Invalid investment for bonus tokens"
        );
        TransferHelper.safeTransferFrom(
            tokenAddress,
            _msgSender(),
            address(this),
            value / dollarDecimals
        );
        users[_msgSender()].investedDollarsInBonusSlots +=
            value /
            uint128(paymentTokenDecimals);
        uint256 _tokens = (value * 100 * 1000 * 10**(OZT.decimals())) /
            (currentTokenPrice() *
                bonuspercentage *
                paymentTokenDecimals *
                dollarDecimals);
        saveInvestmentDetails(
            _msgSender(),
            _tokens,
            (value / paymentTokenDecimals),
            true
        );
        OZT.mint(address(this), _tokens);
        emit BonusAllocation(
            _msgSender(),
            (currentTokenPrice() / 2),
            _tokens,
            block.timestamp,
            value,
            paymentTokenDecimals,
            users[_msgSender()].investmentCounter
        );
    }

    /***
     *  @dev Return drip for particular investment
     *  @param user is address of user
     *  @param counter is investment serial number
     */

    function calculateDrip(address user, uint64 counter)
        public
        view
        returns (uint256)
    {
        uint256 daysOver;
        uint256 dailyIncome;
        daysOver =
            (block.timestamp - investment[user][counter].time) /
            DAYS_IN_SECONDS;
        if (daysOver > 180) {
            dailyIncome = investment[user][counter].tokens;
            return
                daysOver <= 1640
                    ? (dailyIncome * (daysOver - 30)) / 1640
                    : (dailyIncome * (1640)) / 1640;
        } else {
            return 0;
        }
    }

    /**
     *  @dev For drip withdrawal
     *  @param counter is serial investment number
     */

    function dripWithdrawal(uint32 counter) public nonReentrant {
        uint256 drip = _dripwithdrawal(_msgSender(), counter);
        investment[_msgSender()][counter].totalTokensWithdrawn += uint128(drip);
        TransferHelper.safeTransfer(address(OZT), _msgSender(), drip);
        emit DripWithdrawal(_msgSender(), counter, drip, block.timestamp);
    }

    /***
     *  @dev For saving details of user
     *  @param _referrer is user's referrer address
     *  @param user is user address
     */

    function saveDetailsOfUser(
        address _referrer,
        address user,
        bool check
    ) internal {
        users[user].id = uint64(currentId);
        users[user].referrer = _referrer;
        idToAddress[currentId] = user;
        users[user].mintedOnce = true;
        if (check) {
            emit Registration(
                user,
                _referrer,
                currentId,
                users[_referrer].id,
                block.timestamp,
                users[user].KYC
            );
        }
        currentId++;
    }

    /**
     *  @dev Internal Transfer reffral bonus to refferrals
     *  @param value is amount of dollars
     *  @param paymentTokenDecimals is decimal of token
     *  @param _referrer is users referrer address
     *  @param user is user address
     *  @param tokenAddress is address of token
     */

    function reffralBonus(
        uint128 value,
        uint256 paymentTokenDecimals,
        address _referrer,
        address user,
        address tokenAddress,
        bool referralIncome
    ) internal {
        uint256 ozOperationsamount = value / 5;
        uint256 referralAmount;

        if (referralIncome) {
            if (value < 300 * paymentTokenDecimals * dollarDecimals) {
                referralAmount = value / 10;
            } else {
                referralAmount = 30 * paymentTokenDecimals * dollarDecimals;
            }

            TransferHelper.safeTransfer(
                tokenAddress,
                _referrer,
                (referralAmount / dollarDecimals)
            );
        }

        TransferHelper.safeTransfer(
            tokenAddress,
            ozOperations,
            ((ozOperationsamount - referralAmount) / dollarDecimals)
        );
        emit ReffralIncome(
            user,
            _referrer,
            referralAmount,
            (ozOperationsamount - referralAmount),
            paymentTokenDecimals,
            block.timestamp
        );
    }

    /**
     *  @dev Internal function for purchasing slots in multiple of 3500$
     *  @param value is amount of dollars
     *  @param paymentTokenDecimals is decimal of token
     *  @param user is user address
     */

    function _reserveSlot(
        uint128 value,
        uint256 paymentTokenDecimals,
        address user
    ) internal {
        uint256 n = (value / (maxInvestmentCap * paymentTokenDecimals));
        uint256 _tokens;
        uint256 tokens;
        uint256 _publicSaleInDollars = publicSaleInDollars;

        for (uint256 i = 1; i <= n; i++) {
            tokens =
                (maxInvestmentCap * 1000 * 10**(OZT.decimals())) /
                (_currentTokenPrice(_publicSaleInDollars) * dollarDecimals);
            emit PurchaseTokens(
                user,
                tokens,
                users[user].investmentCounter + 1,
                block.timestamp,
                false,
                _currentTokenPrice(_publicSaleInDollars),
                maxInvestmentCap * paymentTokenDecimals,
                false,
                paymentTokenDecimals,
                _currentTokenPrice(_publicSaleInDollars + maxInvestmentCap)
            );
            _publicSaleInDollars += (maxInvestmentCap);
            _tokens += tokens;
        }

        saveInvestmentDetails(
            user,
            _tokens,
            (value / (paymentTokenDecimals)),
            false
        );
        OZT.mint(address(this), _tokens);
    }

    /***
     *  @dev Internal function for saving particular investment details
     *  @param user is user address
     *  @param _tokens is the number of tokens
     *  @param _publicSaleInDollars value in dollar
     */

    function saveInvestmentDetails(
        address user,
        uint256 _tokens,
        uint256 _publicSaleInDollars,
        bool increasePrice
    ) internal {
        users[user].investmentCounter++;
        investment[user][users[user].investmentCounter].tokens = uint64(
            _tokens
        );
        users[user].totalTokens += _tokens;
        investment[user][users[user].investmentCounter].time = uint64(
            block.timestamp
        );
        increasePrice
            ? publicSaleInDollars
            : publicSaleInDollars += _publicSaleInDollars;
    }

    /***
     *  @dev Internal function for  reserving slot or for purchaing token with less then 3500$
     *  @param value  is value in dollar
     *  @param paymentTokenDecimals is decimal of token
     *  @param user is user address
     */

    function invest(
        uint128 value,
        uint256 paymentTokenDecimals,
        address user
    ) internal {
        if (users[user].lastInvestmentTimestamp != uint64(0)) {
            require(
                ((block.timestamp - users[user].lastInvestmentTimestamp) /
                    DAYS_IN_SECONDS <=
                    30),
                "OZV0 : Sold in flash sale"
            );
        }

        require(
            (
                (users[user].investedDollars + (value / paymentTokenDecimals) <=
                    maxInvestmentCap)
            ),
            "OZV0 : User can only reserve a slot once"
        );
        users[user].investedDollars += value / uint128(paymentTokenDecimals);

        if (users[user].lastInvestmentTimestamp == uint64(0)) {
            users[user].KYC
                ? users[user].tokenPrice = uint64(currentTokenPrice())
                : users[user].tokenPrice;
            users[user].lastInvestmentTimestamp = uint32(block.timestamp);
            getTokenBuyPrice(user, paymentTokenDecimals, value, false);
        } else {
            getTokenBuyPrice(user, paymentTokenDecimals, value, true);
        }
    }

    /**
     *  @dev Internal function that is used to mint OZ token depending upon KYC or non - KYC user
     *  @param value value in dollar
     *  @param paymentTokenDecimals is decimal of token
     *  @param user is the user address
     *  @param increasePrice is indicator to increase or decrease price of OZ token
     */

    function getTokenBuyPrice(
        address user,
        uint256 paymentTokenDecimals,
        uint256 value,
        bool increasePrice
    ) internal {
        uint256 _tokens;
        uint256 price;
        bool sellOnCurrentPrice;

        if (users[user].tokenPrice == uint64(0)) {
            price = currentTokenPrice();
            sellOnCurrentPrice = true;
        } else {
            price = users[user].tokenPrice;
        }

        _tokens =
            (value * 1000 * 10**(OZT.decimals())) /
            ((price) * paymentTokenDecimals * dollarDecimals);
        saveInvestmentDetails(user, _tokens, maxInvestmentCap, increasePrice);

        if (users[user].tokenPrice != uint64(0) && users[user].mintedOnce) {
            OZT.mint(
                address(this),
                ((maxInvestmentCap * 1000 * 10**(OZT.decimals())) /
                    (users[user].tokenPrice * dollarDecimals))
            );
            users[user].mintedOnce = false;
        } else if (users[user].tokenPrice == uint64(0)) {
            OZT.mint(address(this), _tokens);
        }

        emit PurchaseTokens(
            user,
            _tokens,
            users[user].investmentCounter,
            block.timestamp,
            true,
            price,
            value,
            sellOnCurrentPrice,
            paymentTokenDecimals,
            currentTokenPrice()
        );
    }

    /**
     *  @dev Internal function to save drip withdrawal details
     *  @param user is the user address
     *  @param counter is investment number
     */

    function _dripwithdrawal(address user, uint64 counter)
        public
        view
        returns (uint256 dripToTransfer)
    {
        uint256 drip = calculateDrip(user, counter);
        drip = drip - (investment[user][(counter)].totalTokensWithdrawn);
        require(drip > 0, "OZV0: Drip not generated yet");

        if (drip > OZT.balanceOf(address(this))) {
            drip = OZT.balanceOf(address(this));
        }

        return drip;
    }

    /***
     *  @dev For selling OZ token
     *  @param tokenAddresses is the  array of address stable coins
     *  @param numberOfTokens is the array of number of stable coins
     *  @param numberOfTokens is the array of number of stable coins
     */

    function sellToken(
        address[] memory tokenAddresses,
        uint256[] memory numberOfTokens,
        uint64 investmentCounter
    ) public nonReentrant {
        uint256 dollars;
        uint256 _tokens;

        for (uint256 i = 0; i <= tokenAddresses.length - 1; i++) {
            require(
                (tokenIsRegistered[tokenAddresses[i]]),
                "OZV0:Token is not  registered"
            );
            paymentToken = IERC20(tokenAddresses[i]);
            require(
                (paymentToken.balanceOf(address(this)) >=
                    numberOfTokens[i] / dollarDecimals),
                "OZV0 : Insufficient tokens in contract"
            );
            TransferHelper.safeTransfer(
                tokenAddresses[i],
                _msgSender(),
                (numberOfTokens[i] / dollarDecimals)
            );
            dollars += numberOfTokens[i] / (10**paymentToken.decimals());
        }
        require(
            (dollars < maxInvestmentCap) ||
                ((dollars >= maxInvestmentCap) &&
                    (dollars % maxInvestmentCap == uint256(0))),
            "OZV0 : Selling only allowed for less then 3500$ or for multiple of 3500$"
        );
        if (dollars < maxInvestmentCap) {
            if (soldInDollars + dollars < maxInvestmentCap) {
                soldInDollars += dollars;
                _tokens = ((dollars * 100000 * 10**(OZT.decimals())) /
                    (currentTokenPrice() * 72 * dollarDecimals));
                emit SellToken(
                    _msgSender(),
                    _tokens,
                    currentTokenPrice(),
                    block.timestamp,
                    investmentCounter,
                    currentTokenPrice()
                );
            } else if (soldInDollars + dollars == maxInvestmentCap) {
                soldInDollars = uint256(0);
                _tokens = ((dollars * 100000 * 10**(OZT.decimals())) /
                    (currentTokenPrice() * 72 * dollarDecimals));
                emit SellToken(
                    _msgSender(),
                    _tokens,
                    currentTokenPrice(),
                    block.timestamp,
                    investmentCounter,
                    currentTokenPrice()
                );
                publicSaleInDollars -= maxInvestmentCap;
            } else {
                uint256 offsetTokens;
                uint256 offset;
                offset = maxInvestmentCap - soldInDollars;
                _tokens = ((offset * 100000 * 10**(OZT.decimals())) /
                    (currentTokenPrice() * 72 * dollarDecimals));
                emit SellToken(
                    _msgSender(),
                    _tokens,
                    currentTokenPrice(),
                    block.timestamp,
                    investmentCounter,
                    currentTokenPrice()
                );
                publicSaleInDollars -= maxInvestmentCap;
                soldInDollars = dollars - offset;
                offsetTokens = ((soldInDollars *
                    100000 *
                    10**(OZT.decimals())) /
                    (currentTokenPrice() * 72 * dollarDecimals));
                emit SellToken(
                    _msgSender(),
                    offsetTokens,
                    currentTokenPrice(),
                    block.timestamp,
                    investmentCounter,
                    currentTokenPrice()
                );
                _tokens += offsetTokens;
            }
        } else {
            uint256 tokens;
            uint256 n = (dollars / (maxInvestmentCap));
            uint256 _publicSaleInDollars = publicSaleInDollars;

            for (uint256 i = 1; i <= n; i++) {
                tokens = ((maxInvestmentCap * 100000 * 10**(OZT.decimals())) /
                    (_currentTokenPrice(_publicSaleInDollars) *
                        72 *
                        dollarDecimals));
                emit SellToken(
                    _msgSender(),
                    tokens,
                    currentTokenPrice(),
                    block.timestamp,
                    investmentCounter,
                    currentTokenPrice()
                );
                _publicSaleInDollars -= (maxInvestmentCap);
                _tokens += tokens;
            }

            publicSaleInDollars -= dollars;
        }

        if (investmentCounter == uint256(0)) {
            require(
                (OZT.balanceOf(_msgSender()) >= _tokens),
                "OZV0 : Insufficient OZ Tokens"
            );
            TransferHelper.safeTransferFrom(
                address(OZT),
                _msgSender(),
                address(this),
                _tokens
            );
        } else {
            uint256 drip = _dripwithdrawal(_msgSender(), investmentCounter);

            require(drip > _tokens, "Invalid parameters in sell");
            investment[_msgSender()][investmentCounter]
                .totalTokensWithdrawn += uint128(_tokens);
        }

        OZT.burn(_tokens);
    }

    function updateDAYS_IN_SECONDS(uint256 sec) public onlyOwnerAccess {
        DAYS_IN_SECONDS = sec;
    }
}
