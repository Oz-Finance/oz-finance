import {
  OZV0,
  OZV0__factory,
  OwnedUpgradeabilityProxy,
  OwnedUpgradeabilityProxy__factory,
  BUSD,
  BUSD__factory,
  USDT__factory,
  OZT__factory,
} from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";
import { mineBlocks } from "./utilities/utilities";
import { expect } from "chai";
import {
  expandTo18Decimals,
  expandTo30Decimals,
  expandTo12Decimals,
  expandTo6Decimals,
} from "./utilities/utilities";

describe("OZ", async () => {
  let impl: OZV0;
  let OZ: OZV0;
  let owner: SignerWithAddress;
  let signers: SignerWithAddress[];
  let proxy: OwnedUpgradeabilityProxy;
  let BUSD: BUSD;
  let USDT: any;
  let OZT: any;
  beforeEach(async () => {
    signers = await ethers.getSigners();
    owner = signers[0];

    proxy = await new OwnedUpgradeabilityProxy__factory(owner).deploy();
    impl = await new OZV0__factory(owner).deploy();
    OZ = await new OZV0__factory(owner).attach(proxy.address);
    OZT = await new OZT__factory(owner).deploy("OZToken", "OZT");
    const initializeData = impl.interface.encodeFunctionData("initialize", [
      owner.address,
      OZT.address,
      signers[1].address,
    ]);
    await proxy.upgradeToAndCall(impl.address, initializeData);
  });

  describe("Token Deployment", async () => {
    it("Deployment : Total supply matched", async () => {
      BUSD = await new BUSD__factory(owner).deploy("BUSD", "BUSD");
      expect(await BUSD.totalSupply()).to.be.eq(expandTo18Decimals(1000000));
    });
  });

  describe("Registration", async () => {
    it("Register: Fail, when registration tried by  user other then owner", async () => {
      let user = signers[2];
      await expect(
        OZ.connect(user).completeKYC(owner.address, user.address, true)
      ).to.be.revertedWith("OZV0: Only owner has the access");
    });

    it("Register: Fail, when a user is registered twice", async () => {
      let user = signers[2];
      await expect(
        OZ.connect(owner).completeKYC(owner.address, user.address, true)
      );
      await expect(
        OZ.connect(owner).completeKYC(owner.address, user.address, true)
      ).to.be.revertedWith("OZV0:User has already done KYC");
    });

    it("Register: Fail, when referrer does not exists", async () => {
      let user1 = signers[2];
      let user2 = signers[3];
      await expect(
        OZ.connect(owner).completeKYC(user1.address, user2.address, true)
      ).to.be.revertedWith("OZV0:Referrer does not exists");
    });

    it("Register: Success, user registered", async () => {
      let user1 = signers[2];
      let user2 = signers[3];
      let user3 = signers[4];
      await OZ.connect(owner).completeKYC(owner.address, user1.address, true);
      await OZ.connect(owner).completeKYC(user1.address, user2.address, true);
      await OZ.connect(owner).completeKYC(user1.address, user3.address, true);
      expect((await OZ.users(user2.address)).referrer).to.be.eq(user1.address);
      expect((await OZ.users(user1.address)).referrer).to.be.eq(owner.address);
      expect((await OZ.users(user2.address)).KYC).to.be.eq(true);
    });

    it("Register: Success,current id increased", async () => {
      let user = signers[2];
      await OZ.connect(owner).completeKYC(owner.address, user.address, true);
      expect((await OZ.users(user.address)).id).to.be.eq(2);
    });
  });

  describe("Complete KYC", async () => {
    it("Completing KYC: Fail,if user is already KYC", async () => {
      let user1 = signers[2];
      await OZ.connect(owner).completeKYC(owner.address, user1.address, true);
      await expect(
        OZ.connect(owner).completeKYC(owner.address, user1.address, true)
      ).to.be.revertedWith("OZV0:User has already done KYC");
    });

    it("Completing KYC: Success", async () => {
      let user = signers[2];
      let user2 = signers[4];
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);
      await BUSD.connect(user).transfer(
        user2.address,
        expandTo18Decimals(5000)
      );
      await BUSD.connect(user2).approve(OZ.address, expandTo18Decimals(5000));

      await OZ.connect(user2).purchaseTokens(
        expandTo30Decimals(700),
        BUSD.address,
        "0x0000000000000000000000000000000000000000"
      );
      expect((await OZ.users(user2.address)).KYC).to.be.eq(false);
      await OZ.connect(owner).completeKYC(owner.address, user2.address, true);
      expect((await OZ.users(user2.address)).KYC).to.be.eq(true);
    });
  });

  describe("Token Registration", async () => {
    it("Token Register : Fail, if a user other then owner tries to completeKYC a token", async () => {
      let user1 = signers[2];
      BUSD = await new BUSD__factory(owner).deploy("BUSD", "BUSD");
      await expect(OZ.connect(user1).addToken(BUSD.address)).to.be.revertedWith(
        "OZV0: Only owner has the access"
      );
    });

    it("Token Register : Fail, if token is already registered", async () => {
      BUSD = await new BUSD__factory(owner).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);
      await expect(OZ.connect(owner).addToken(BUSD.address)).to.be.revertedWith(
        "OZV0:Token already exists"
      );
    });

    it("Token Register : Success", async () => {
      BUSD = await new BUSD__factory(owner).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);
      // expect(await OZ.tokenIsRegistered(BUSD.address)).to.be.eq(true);
    });
  });

  describe("Check token price", async () => {
    it("Token price matched: Success", async () => {
      expect(await OZ.currentTokenPrice()).to.be.eq("8000");
    });
  });

  describe("Purchase Tokens", async () => {
    it("Purchasing Tokens: Fail, if token is not registered", async () => {
      let user = signers[2];
      let user1 = signers[3];
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await BUSD.connect(user).transfer(user1.address, expandTo18Decimals(500));
      await BUSD.connect(user1).approve(OZ.address, expandTo18Decimals(500));
      await expect(
        OZ.connect(user1).purchaseTokens(
          expandTo30Decimals(500),
          BUSD.address,
          user1.address
        )
      ).to.be.revertedWith("OZV0:Token is not  registered");
    });

    it("Purchasing Tokens: Fail, if first investment is less then 100$", async () => {
      let user = signers[2];
      let user1 = signers[3];
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).completeKYC(owner.address, user.address, true);
      await OZ.connect(owner).addToken(BUSD.address);
      await BUSD.connect(user).transfer(
        user1.address,
        expandTo18Decimals(21000)
      );
      await BUSD.connect(user1).approve(OZ.address, expandTo18Decimals(21000));
      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(7000),
        BUSD.address,
        user.address
      );
      await expect(
        OZ.connect(user1).purchaseTokens(
          expandTo30Decimals(99),
          BUSD.address,
          user.address
        )
      ).to.be.revertedWith(
        "OZV0: Investment less then 100$ and multiple of 100$ is allowed"
      );

      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(100),
        BUSD.address,
        user.address
      );
      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(99),
        BUSD.address,
        user.address
      );
      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(3500),
        BUSD.address,
        user.address
      );
      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(99),
        BUSD.address,
        user.address
      );
      await expect(
        OZ.connect(user1).purchaseTokens(
          expandTo30Decimals(3203),
          BUSD.address,
          user.address
        )
      ).to.be.revertedWith("OZV0 : User can only reserve a slot once");
      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(3202),
        BUSD.address,
        user.address
      );
    });

    it("Purchasing Tokens: Fail , if investment is not a multiple of 3500$", async () => {
      let user = signers[2];
      let user1 = signers[3];
      let user2 = signers[4];
      let ozOperations = signers[1];
      await OZ.connect(owner).completeKYC(owner.address, user.address, true);
      await OZ.connect(owner).completeKYC(user.address, user1.address, true);
      await OZ.connect(owner).completeKYC(user1.address, user2.address, true);
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);
      await BUSD.connect(user).transfer(
        user2.address,
        expandTo18Decimals(5000)
      );
      await BUSD.connect(user2).approve(OZ.address, expandTo18Decimals(5000));

      await expect(
        OZ.connect(user2).purchaseTokens(
          expandTo30Decimals(3600),
          BUSD.address,
          user.address
        )
      ).to.be.revertedWith(
        "OZV0 : Investment should be in multiple of 3500 dollars"
      );
    });

    it("Purchasing Tokens: Fail, if referrer doesnot exists", async () => {
      let user = signers[2];
      let user1 = signers[3];
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);
      await BUSD.connect(user).transfer(
        user1.address,
        expandTo18Decimals(5000)
      );
      await BUSD.connect(user1).approve(OZ.address, expandTo18Decimals(5000));
      await expect(
        OZ.connect(user1).purchaseTokens(
          expandTo30Decimals(100),
          BUSD.address,
          user.address
        )
      ).to.be.revertedWith("OZV0:Referrer does not exists");
    });

    it("Purchasing tokens:Success, if a user goes without referrer address,by owner will be his referrer", async () => {
      let user = signers[2];
      let user2 = signers[3];
      let user3 = signers[4];
      let user4 = signers[5];
      let user5 = signers[6];
      await OZ.connect(owner).completeKYC(owner.address, user4.address, true);
      await OZ.connect(owner).completeKYC(user4.address, user5.address, true);

      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);
      await BUSD.connect(user).transfer(
        user2.address,
        expandTo18Decimals(5000)
      );
      await BUSD.connect(user2).approve(OZ.address, expandTo18Decimals(5000));
      await BUSD.connect(user).transfer(
        user3.address,
        expandTo18Decimals(5000)
      );
      await BUSD.connect(user3).approve(OZ.address, expandTo18Decimals(5000));
      await BUSD.connect(user).transfer(
        user5.address,
        expandTo18Decimals(5000)
      );
      await BUSD.connect(user5).approve(OZ.address, expandTo18Decimals(5000));

      await OZ.connect(user2).purchaseTokens(
        expandTo30Decimals(3500),
        BUSD.address,
        "0x0000000000000000000000000000000000000000"
      );
      await OZ.connect(user3).purchaseTokens(
        expandTo30Decimals(3500),
        BUSD.address,
        user2.address
      );
      await OZ.connect(user5).purchaseTokens(
        expandTo30Decimals(3500),
        BUSD.address,
        "0x0000000000000000000000000000000000000000"
      );

      expect((await OZ.users(user2.address)).referrer).to.be.eq(owner.address);
      expect((await OZ.users(user3.address)).referrer).to.be.eq(user2.address);
      expect((await OZ.users(user5.address)).referrer).to.be.eq(user4.address);
    });

    it("Purchasing Tokens: Success , if investment is greater then 100$ or is 100$", async () => {
      let user = signers[2];
      let user1 = signers[3];
      let user2 = signers[4];
      await OZ.connect(owner).completeKYC(owner.address, user.address, true);
      await OZ.connect(owner).completeKYC(user.address, user1.address, true);
      await OZ.connect(owner).completeKYC(user1.address, user2.address, true);
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);
      await BUSD.connect(user).transfer(
        user2.address,
        expandTo18Decimals(5000)
      );
      await BUSD.connect(user2).approve(OZ.address, expandTo18Decimals(5000));

      await OZ.connect(user2).purchaseTokens(
        expandTo30Decimals(700),
        BUSD.address,
        user.address
      );
    });

    it("Purchasing Tokens: Success, User can invest without KYC", async () => {
      let user = signers[2];
      let user1 = signers[3];
      await OZ.connect(owner).completeKYC(owner.address, user.address, true);
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);
      await BUSD.connect(user).transfer(
        user1.address,
        expandTo18Decimals(5000)
      );
      await BUSD.connect(user1).approve(OZ.address, expandTo18Decimals(5000));
      expect((await OZ.users(user1.address)).investmentCounter).to.be.eq(0);
      expect((await OZ.users(user1.address)).id).to.be.eq("0");

      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(100),
        BUSD.address,
        user.address
      );
      expect((await OZ.users(user1.address)).investmentCounter).to.be.eq(1);
      expect((await OZ.users(user1.address)).id).to.be.eq("3");
      expect((await OZ.users(user1.address)).referrer).to.be.eq(user.address);
      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(100),
        BUSD.address,
        user.address
      );
      expect((await OZ.users(user1.address)).investmentCounter).to.be.eq(2);
      expect((await OZ.users(user1.address)).id).to.be.eq("3");
      expect((await OZ.users(user1.address)).referrer).to.be.eq(user.address);
    });
    it("Purchasing Tokens: Success, User can invest after doing  KYC", async () => {
      let user = signers[2];
      let user1 = signers[3];
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).completeKYC(owner.address, user1.address, true);
      await OZ.connect(owner).addToken(BUSD.address);
      await BUSD.connect(user).transfer(
        user1.address,
        expandTo18Decimals(5000)
      );
      await BUSD.connect(user1).approve(OZ.address, expandTo18Decimals(5000));
      expect((await OZ.users(user1.address)).id).to.be.eq("2");
      expect((await OZ.users(user1.address)).referrer).to.be.eq(owner.address);
      expect((await OZ.users(user1.address)).KYC).to.be.eq(true);

      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(100),
        BUSD.address,
        user.address
      );

      expect((await OZ.users(user1.address)).id).to.be.eq("2");
      expect((await OZ.users(user1.address)).referrer).to.be.eq(owner.address);
    });
    it("Purchasing Tokens: Success, bonus tokens not alloted to referrer if user has not done KYC", async () => {
      let user = signers[2];
      let user1 = signers[3];
      let user2 = signers[4];
      await OZ.connect(owner).completeKYC(owner.address, user.address, true);
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);
      await BUSD.connect(user).transfer(
        user1.address,
        expandTo18Decimals(5000)
      );
      await BUSD.connect(user).transfer(
        user2.address,
        expandTo18Decimals(5000)
      );
      await BUSD.connect(user1).approve(OZ.address, expandTo18Decimals(5000));
      await BUSD.connect(user2).approve(OZ.address, expandTo18Decimals(5000));

      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(100),
        BUSD.address,
        user.address
      );
      expect((await OZ.users(user.address)).bonusMatrixAllocation).to.be.eq(0);
    });

    it("Purchasing Tokens: Success, bonus tokens allocation only once per referrer, if user and referrer have completed there KYC and referrer has also done one or more investments", async () => {
      let user = signers[2];
      let user1 = signers[3];
      let user2 = signers[4];
      await OZ.connect(owner).completeKYC(owner.address, user.address, true);
      await OZ.connect(owner).completeKYC(user.address, user1.address, true);
      await OZ.connect(owner).completeKYC(user.address, user2.address, true);
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);
      await BUSD.connect(user).transfer(
        user1.address,
        expandTo18Decimals(5000)
      );
      await BUSD.connect(user).transfer(
        user2.address,
        expandTo18Decimals(5000)
      );
      await BUSD.connect(user).approve(OZ.address, expandTo18Decimals(5000));
      await BUSD.connect(user1).approve(OZ.address, expandTo18Decimals(5000));
      await BUSD.connect(user2).approve(OZ.address, expandTo18Decimals(5000));

      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(100),
        BUSD.address,
        user.address
      );
      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(100),
        BUSD.address,
        user.address
      );
      await OZ.connect(user).purchaseTokens(
        expandTo30Decimals(100),
        BUSD.address,
        owner.address
      );
      await OZ.connect(user).purchaseTokens(
        expandTo30Decimals(100),
        BUSD.address,
        owner.address
      );
      await OZ.connect(user2).purchaseTokens(
        expandTo30Decimals(100),
        BUSD.address,
        user.address
      );

      expect((await OZ.users(user.address)).bonusMatrixAllocation).to.be.eq(1);
    });

    it("Purchasing Tokens: Success,reffaral bonus and OZoperations amount matched if investment is under 300$", async () => {
      let user = signers[2];
      let user1 = signers[3];
      let user2 = signers[4];
      let ozOperations = signers[1];
      await OZ.connect(owner).completeKYC(owner.address, user.address, true);
      await OZ.connect(owner).completeKYC(user.address, user1.address, true);
      await OZ.connect(owner).completeKYC(user1.address, user2.address, true);
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);
      await BUSD.connect(user).transfer(
        user2.address,
        expandTo18Decimals(5000)
      );
      await BUSD.connect(user).transfer(user1.address, expandTo18Decimals(100));
      await BUSD.connect(user2).approve(OZ.address, expandTo18Decimals(5000));
      await BUSD.connect(user1).approve(OZ.address, expandTo18Decimals(100));
      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(100),
        BUSD.address,
        user1.address
      );
      await OZ.connect(user2).purchaseTokens(
        expandTo30Decimals(100),
        BUSD.address,
        user1.address
      );
      expect(await BUSD.balanceOf(user1.address)).to.be.eq(
        expandTo18Decimals(10)
      );
      expect(await BUSD.balanceOf(ozOperations.address)).to.be.eq(
        expandTo18Decimals(30)
      );
    });

    it("Purchasing Tokens : Success ,referr bonus goes only one time to refererr,if investment is done multiple times in multiple of 3500$", async () => {
      let ozOperations = signers[1];
      let user = signers[2];
      let user1 = signers[3];
      let user2 = signers[4];

      await OZ.connect(owner).completeKYC(owner.address, user.address, true);
      await OZ.connect(owner).completeKYC(user.address, user1.address, true);
      await OZ.connect(owner).completeKYC(user1.address, user2.address, true);
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);
      await BUSD.connect(user).transfer(
        user2.address,
        expandTo18Decimals(7000)
      );
      await BUSD.connect(user2).approve(OZ.address, expandTo18Decimals(7000));
      await BUSD.connect(user).transfer(
        user1.address,
        expandTo18Decimals(7000)
      );
      await BUSD.connect(user1).approve(OZ.address, expandTo18Decimals(7000));
      expect((await OZ.users(user2.address)).investmentCounter).to.be.eq(0);

      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(7000),
        BUSD.address,
        user1.address
      );

      await OZ.connect(user2).purchaseTokens(
        expandTo30Decimals(3500),
        BUSD.address,
        user1.address
      );

      expect(await BUSD.balanceOf(user1.address)).to.be.eq(
        expandTo18Decimals(30)
      );
      expect(await BUSD.balanceOf(ozOperations.address)).to.be.eq(
        expandTo18Decimals(2070)
      );
      expect((await OZ.users(user2.address)).investmentCounter).to.be.eq(1);
      await OZ.connect(user2).purchaseTokens(
        expandTo30Decimals(3500),
        BUSD.address,
        user1.address
      );
      expect((await OZ.users(user2.address)).investmentCounter).to.be.eq(2);
      expect(await BUSD.balanceOf(user1.address)).to.be.eq(
        expandTo18Decimals(30)
      );
      expect(await BUSD.balanceOf(ozOperations.address)).to.be.eq(
        expandTo18Decimals(2070)
      );
    });

    it("Purchasing Tokens :  Success ,referr bonus goes only one time to refererr,if investment is done within 3500$", async () => {
      let ozOperations = signers[1];
      let user = signers[2];
      let user1 = signers[3];
      let user2 = signers[4];
      let user3 = signers[5];

      await OZ.connect(owner).completeKYC(owner.address, user.address, true);
      await OZ.connect(owner).completeKYC(user.address, user1.address, true);
      await OZ.connect(owner).completeKYC(user1.address, user2.address, true);
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);
      await BUSD.connect(user).transfer(
        user2.address,
        expandTo18Decimals(7000)
      );
      await BUSD.connect(user2).approve(OZ.address, expandTo18Decimals(7000));
      await BUSD.connect(user).transfer(
        user1.address,
        expandTo18Decimals(7000)
      );
      await BUSD.connect(user).transfer(
        user3.address,
        expandTo18Decimals(7000)
      );
      await BUSD.connect(user1).approve(OZ.address, expandTo18Decimals(7000));
      await BUSD.connect(user3).approve(OZ.address, expandTo18Decimals(7000));
      expect((await OZ.users(user2.address)).investmentCounter).to.be.eq(0);
      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(7000),
        BUSD.address,
        user1.address
      );

      await OZ.connect(user2).purchaseTokens(
        expandTo30Decimals(100),
        BUSD.address,
        user1.address
      );
      await OZ.connect(user3).purchaseTokens(
        expandTo30Decimals(100),
        BUSD.address,
        user1.address
      );
      expect(await BUSD.balanceOf(user1.address)).to.be.eq(
        expandTo18Decimals(10)
      );

      expect(await BUSD.balanceOf(ozOperations.address)).to.be.eq(
        expandTo18Decimals(1430)
      );
      expect((await OZ.users(user2.address)).investmentCounter).to.be.eq(1);
      await OZ.connect(user2).purchaseTokens(
        expandTo30Decimals(100),
        BUSD.address,
        user1.address
      );
      expect((await OZ.users(user2.address)).investmentCounter).to.be.eq(2);
      expect(await BUSD.balanceOf(user1.address)).to.be.eq(
        expandTo18Decimals(10)
      );
      expect(await BUSD.balanceOf(ozOperations.address)).to.be.eq(
        expandTo18Decimals(1430)
      );
    });
  });

  describe("Purchasing Tokens internally", async () => {
    it("Purchasing Tokens internally: Fail,if user try to reserve a slot twice", async () => {
      let user = signers[2];
      let user1 = signers[3];
      await OZ.connect(owner).completeKYC(owner.address, user1.address, true);
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);

      await BUSD.connect(user).transfer(
        user1.address,
        expandTo18Decimals(21000)
      );
      await BUSD.connect(user1).approve(OZ.address, expandTo18Decimals(21000));
      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(3400),
        BUSD.address,
        user1.address
      );
      expect((await OZ.users(user1.address)).investmentCounter).to.be.eq(1);
      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(100),
        BUSD.address,
        user1.address
      );
      expect((await OZ.users(user1.address)).investmentCounter).to.be.eq(2);

      await expect(
        OZ.connect(user1).purchaseTokens(
          expandTo30Decimals(100),
          BUSD.address,
          user1.address
        )
      ).to.be.revertedWith("OZV0 : User can only reserve a slot once");
    });

    it("Purchasing Tokens internally: Success,For a KYC user price freezes for 30 days", async () => {
      let user = signers[2];
      let user1 = signers[3];
      await OZ.connect(owner).completeKYC(owner.address, user1.address, true);
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);

      await BUSD.connect(user).transfer(
        user1.address,
        expandTo18Decimals(21000)
      );
      await BUSD.connect(user1).approve(OZ.address, expandTo18Decimals(21000));
      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(100),
        BUSD.address,
        "0x0000000000000000000000000000000000000000"
      );

      expect((await OZ.users(user1.address)).investmentCounter).to.be.eq(1);
      expect((await OZ.users(user1.address)).tokenPrice).to.be.eq("8000");
      expect(await OZT.balanceOf(OZ.address)).to.be.eq("43750000000");
      expect(await OZ.currentTokenPrice()).to.be.eq("8008");
      expect((await OZ.users(user1.address)).investedDollars).to.be.eq(
        expandTo12Decimals(100)
      );
      expect((await OZ.investment(user1.address, 1)).tokens).to.be.eq(
        "1250000000"
      );

      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(200),
        BUSD.address,
        "0x0000000000000000000000000000000000000000"
      );
      expect((await OZ.users(user1.address)).investmentCounter).to.be.eq(2);
      expect((await OZ.users(user1.address)).tokenPrice).to.be.eq("8000");
      expect(await OZT.balanceOf(OZ.address)).to.be.eq("43750000000");
      expect(await OZ.currentTokenPrice()).to.be.eq("8008");
      expect((await OZ.users(user1.address)).investedDollars).to.be.eq(
        expandTo12Decimals(300)
      );
      expect((await OZ.investment(user1.address, 2)).tokens).to.be.eq(
        "2500000000"
      );
      await OZ.connect(user1).purchaseTokens(
        "100000000000000000000000000000000",
        BUSD.address,
        "0x0000000000000000000000000000000000000000"
      );
      expect(await OZ.currentTokenPrice()).to.be.eq("8008");
    });

    it("Purchasing Tokens internally: Success,For a non  KYC user price does not freeze", async () => {
      let user = signers[2];
      let user1 = signers[3];

      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);

      await BUSD.connect(user).transfer(
        user1.address,
        expandTo18Decimals(21000)
      );
      await BUSD.connect(user1).approve(OZ.address, expandTo18Decimals(21000));
      await BUSD.connect(user).approve(OZ.address, expandTo18Decimals(21000));
      expect(await OZ.currentTokenPrice()).to.be.eq("8000");
      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(100),
        BUSD.address,
        "0x0000000000000000000000000000000000000000"
      );

      expect((await OZ.users(user1.address)).investmentCounter).to.be.eq(1);
      expect((await OZ.users(user1.address)).tokenPrice).to.be.eq("0");
      expect(await OZT.balanceOf(OZ.address)).to.be.eq("1250000000");
      expect(await OZ.currentTokenPrice()).to.be.eq("8008");
      expect((await OZ.users(user1.address)).investedDollars).to.be.eq(
        expandTo12Decimals(100)
      );
      expect((await OZ.investment(user1.address, 1)).tokens).to.be.eq(
        "1250000000"
      );

      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(200),
        BUSD.address,
        "0x0000000000000000000000000000000000000000"
      );
      expect((await OZ.users(user1.address)).investmentCounter).to.be.eq(2);
      expect((await OZ.users(user1.address)).tokenPrice).to.be.eq("0");
      expect(await OZT.balanceOf(OZ.address)).to.be.eq("3747502497");
      expect(await OZ.currentTokenPrice()).to.be.eq("8008");
      expect((await OZ.users(user1.address)).investedDollars).to.be.eq(
        expandTo12Decimals(300)
      );
      expect((await OZ.investment(user1.address, 2)).tokens).to.be.eq(
        "2497502497"
      );
      await OZ.connect(user1).purchaseTokens(
        "200000000000000000000000000000000",
        BUSD.address,
        "0x0000000000000000000000000000000000000000"
      );
      expect(await OZ.currentTokenPrice()).to.be.eq("8008");
      await OZ.connect(user).purchaseTokens(
        expandTo30Decimals(200),
        BUSD.address,
        "0x0000000000000000000000000000000000000000"
      );
      expect(await OZ.currentTokenPrice()).to.be.eq("8016");
    });

    it("Purchasing Tokens internally: Success,if a user first invest in multiple of 3500$ and then reserves a slot ", async () => {
      let user = signers[2];
      let user1 = signers[3];
      await OZ.connect(owner).completeKYC(owner.address, user1.address, true);
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);

      await BUSD.connect(user).transfer(
        user1.address,
        expandTo18Decimals(21000)
      );
      await BUSD.connect(user1).approve(OZ.address, expandTo18Decimals(21000));
      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(7000),
        BUSD.address,
        "0x0000000000000000000000000000000000000000"
      );
      expect((await OZ.users(user1.address)).investmentCounter).to.be.eq(1);
      expect((await OZ.users(user1.address)).tokenPrice).to.be.eq("0");
      expect(await OZT.balanceOf(OZ.address)).to.be.eq("87456293706");
      expect(await OZ.currentTokenPrice()).to.be.eq("8016");
      expect((await OZ.users(user1.address)).investedDollars).to.be.eq("0");
      expect((await OZ.investment(user1.address, 1)).tokens).to.be.eq(
        "87456293706"
      );
      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(100),
        BUSD.address,
        "0x0000000000000000000000000000000000000000"
      );

      expect((await OZ.users(user1.address)).investmentCounter).to.be.eq(2);
      expect((await OZ.users(user1.address)).tokenPrice).to.be.eq("8016");
      expect(await OZT.balanceOf(OZ.address)).to.be.eq("131118968356");
      expect(await OZ.currentTokenPrice()).to.be.eq("8024");
      expect((await OZ.users(user1.address)).investedDollars).to.be.eq(
        expandTo12Decimals(100)
      );
      expect((await OZ.investment(user1.address, 2)).tokens).to.be.eq(
        "1247504990"
      );

      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(3500),
        BUSD.address,
        "0x0000000000000000000000000000000000000000"
      );
      expect((await OZ.users(user1.address)).investmentCounter).to.be.eq(3);
      expect((await OZ.users(user1.address)).tokenPrice).to.be.eq("8016");
      expect(await OZT.balanceOf(OZ.address)).to.be.eq("174738110928");
      expect(await OZ.currentTokenPrice()).to.be.eq("8032");
      expect((await OZ.users(user1.address)).investedDollars).to.be.eq(
        expandTo12Decimals(100)
      );
      expect((await OZ.investment(user1.address, 3)).tokens).to.be.eq(
        "43619142572"
      );

      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(3400),
        BUSD.address,
        "0x0000000000000000000000000000000000000000"
      );
      expect((await OZ.users(user1.address)).investmentCounter).to.be.eq(4);
      expect((await OZ.users(user1.address)).tokenPrice).to.be.eq("8016");
      expect(await OZT.balanceOf(OZ.address)).to.be.eq("174738110928");
      expect(await OZ.currentTokenPrice()).to.be.eq("8032");
      expect((await OZ.users(user1.address)).investedDollars).to.be.eq(
        expandTo12Decimals(3500)
      );
      expect((await OZ.investment(user1.address, 4)).tokens).to.be.eq(
        "42415169660"
      );
      await expect(
        OZ.connect(user1).purchaseTokens(
          expandTo30Decimals(100),
          BUSD.address,
          "0x0000000000000000000000000000000000000000"
        )
      ).to.be.revertedWith("OZV0 : User can only reserve a slot once");
    });

    it("Purchasing Tokens internally: Success ,if user reserve and then try to purchase in multiple of 3500$", async () => {
      let user = signers[2];
      let user1 = signers[3];
      await OZ.connect(owner).completeKYC(owner.address, user1.address, true);
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);

      await BUSD.connect(user).transfer(
        user1.address,
        expandTo18Decimals(21000)
      );
      await BUSD.connect(user1).approve(OZ.address, expandTo18Decimals(21000));
      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(3400),
        BUSD.address,
        user1.address
      );
      expect((await OZ.users(user1.address)).investmentCounter).to.be.eq(1);
      expect((await OZ.users(user1.address)).tokenPrice).to.be.eq("8000");
      expect(await OZT.balanceOf(OZ.address)).to.be.eq("43750000000");
      expect(await OZ.currentTokenPrice()).to.be.eq("8008");
      expect((await OZ.users(user1.address)).investedDollars).to.be.eq(
        expandTo12Decimals(3400)
      );
      expect((await OZ.investment(user1.address, 1)).tokens).to.be.eq(
        "42500000000"
      );
      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(3500),
        BUSD.address,
        user1.address
      );
      expect((await OZ.users(user1.address)).investmentCounter).to.be.eq(2);
      expect((await OZ.users(user1.address)).tokenPrice).to.be.eq("8000");
      expect(await OZT.balanceOf(OZ.address)).to.be.eq("87456293706");
      expect(await OZ.currentTokenPrice()).to.be.eq("8016");
      expect((await OZ.users(user1.address)).investedDollars).to.be.eq(
        expandTo12Decimals(3400)
      );
      expect((await OZ.investment(user1.address, 2)).tokens).to.be.eq(
        "43706293706"
      );
    });

    it("Purchasing Tokens internally: Success, if invested in multiples of 3500$ ", async () => {
      let user = signers[2];
      let user1 = signers[3];
      await OZ.connect(owner).completeKYC(owner.address, user1.address, true);
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);

      await BUSD.connect(user).transfer(
        user1.address,
        expandTo18Decimals(10500)
      );
      await BUSD.connect(user1).approve(OZ.address, expandTo18Decimals(10500));
      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(10500),
        BUSD.address,
        user1.address
      );

      expect((await OZ.investment(user1.address, 1)).tokens).to.be.eq(
        "131118968356"
      );
    });
  });

  describe("Flash Sale", async () => {
    it("Selling token in market: Fail,if user try to buy a slot which is not for flash sale", async () => {
      let user = signers[2];
      let user1 = signers[3];
      await OZ.connect(owner).completeKYC(owner.address, user1.address, true);
      await OZ.connect(owner).completeKYC(user1.address, user.address, true);
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);

      await BUSD.connect(user).transfer(
        user1.address,
        expandTo18Decimals(10500)
      );
      await BUSD.connect(user1).approve(OZ.address, expandTo18Decimals(10500));
      await expect(
        OZ.connect(user).flashSale(
          user1.address,
          BUSD.address,
          expandTo30Decimals(10500)
        )
      ).to.be.revertedWith("OZV0 : Invalid purchase in flash sale");
    });

    it("Selling token in market: Fail,if user try to buy a slot before 30 days", async () => {
      let user = signers[2];
      let user1 = signers[3];
      await OZ.connect(owner).completeKYC(owner.address, user1.address, true);
      await OZ.connect(owner).completeKYC(user1.address, user.address, true);
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);

      await BUSD.connect(user).transfer(
        user1.address,
        expandTo18Decimals(21000)
      );
      await BUSD.connect(user1).approve(OZ.address, expandTo18Decimals(21000));
      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(500),
        BUSD.address,
        user1.address
      );
      await expect(
        OZ.connect(user).flashSale(
          user1.address,
          BUSD.address,
          expandTo30Decimals(3500)
        )
      ).to.be.revertedWith("OZV0 : Invalid purchase in flash sale");
    });
  });

  describe("Withdraw drip", async () => {
    it("Drip withdrawal: Failure, drip is zero", async () => {
      let user = signers[2];
      let user2 = signers[3];

      await OZ.connect(owner).completeKYC(owner.address, user2.address, true);
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);
      await BUSD.connect(user).transfer(
        user2.address,
        expandTo18Decimals(5000)
      );
      await BUSD.connect(user2).approve(OZ.address, expandTo18Decimals(5000));
      await OZ.connect(user2).purchaseTokens(
        expandTo30Decimals(3500),
        BUSD.address,
        owner.address
      );
      await mineBlocks(ethers.provider, 87);
      await expect(OZ.connect(user2).dripWithdrawal(1)).to.be.revertedWith(
        "OZV0: Drip not generated yet"
      );
    });
  });

  describe("Bonus Allocation", async () => {
    it("Purchasing bonus tokens: Fail, if a user tries to purchase bonus tokens without having allocation of bonus tokens", async () => {
      let user = signers[2];
      let user1 = signers[3];
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);
      await BUSD.connect(user).transfer(
        user1.address,
        expandTo18Decimals(5000)
      );
      await BUSD.connect(user1).approve(OZ.address, expandTo18Decimals(5000));
      expect((await OZ.users(user.address)).bonusMatrixAllocation).to.be.eq(0);
      await expect(
        OZ.connect(user1).purchaseOZBonusTokens(
          expandTo30Decimals(100),
          BUSD.address
        )
      ).to.be.revertedWith("OZV0: No bonus allocation yet");
    });

    it("Purchasing bonus tokens: Fail, if user tries to purchase more then the bonus allocation", async () => {
      let user = signers[2];
      let user1 = signers[3];
      let user2 = signers[4];
      await OZ.connect(owner).completeKYC(owner.address, user.address, true);
      await OZ.connect(owner).completeKYC(user.address, user1.address, true);
      await OZ.connect(owner).completeKYC(user.address, user2.address, true);
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);
      await BUSD.connect(user).transfer(
        user1.address,
        expandTo18Decimals(10500)
      );
      await BUSD.connect(user).transfer(
        user2.address,
        expandTo18Decimals(10500)
      );
      await BUSD.connect(user1).approve(OZ.address, expandTo18Decimals(10500));
      await BUSD.connect(user).approve(OZ.address, expandTo18Decimals(10500));
      await BUSD.connect(user2).approve(OZ.address, expandTo18Decimals(10500));
      await OZ.connect(user).purchaseTokens(
        expandTo30Decimals(100),
        BUSD.address,
        owner.address
      );

      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(100),
        BUSD.address,
        user.address
      );
      await OZ.connect(user1).purchaseTokens(
        expandTo30Decimals(100),
        BUSD.address,
        user.address
      );
      await OZ.connect(user2).purchaseTokens(
        expandTo30Decimals(100),
        BUSD.address,
        user.address
      );

      expect((await OZ.users(user.address)).bonusMatrixAllocation).to.be.eq(2);
      await expect(
        OZ.connect(user).purchaseOZBonusTokens(
          expandTo30Decimals(7100),
          BUSD.address
        )
      ).to.be.revertedWith("OZV0: Invalid investment for bonus tokens");
    });
  });

  describe("Reservation of tokens by admin", async () => {
    it("Reserving slot: Fail, tried by another user", async () => {
      let user = signers[2];
      let user1 = signers[3];
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);
      await BUSD.connect(user).transfer(
        user1.address,
        expandTo18Decimals(10500)
      );
      await BUSD.connect(user1).approve(OZ.address, expandTo18Decimals(10500));
      expect((await OZ.users(user.address)).bonusMatrixAllocation).to.be.eq(0);
      await expect(
        OZ.connect(user1.address).slotReservedByAdmin(user1.address, 0)
      ).to.be.revertedWith("OZV0: Only owner has the access");
    });

    it("Reserving slot: Success, if owner reserves a slot for a user, and user tries to invest in multiple of 3500$", async () => {
      let user = signers[1];
      let user1 = signers[2];
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);
      await BUSD.connect(user).transfer(user.address, expandTo18Decimals(7000));
      await BUSD.connect(user).approve(OZ.address, expandTo18Decimals(7000));

      await OZ.connect(owner).slotReservedByAdmin(user.address, "0");
      await OZ.connect(user).purchaseTokens(
        expandTo30Decimals(7000),
        BUSD.address,
        user1.address
      );
      expect((await OZ.users(user.address)).referrer).to.be.eq(owner.address);
      expect((await OZ.users(user.address)).investmentCounter).to.be.eq(1);
      expect((await OZ.users(user.address)).tokenPrice).to.be.eq("8");
      expect((await OZ.users(user.address)).mintedOnce).to.be.eq(true);
      expect(await OZT.balanceOf(OZ.address)).to.be.eq("87456293706");
      expect(await OZ.currentTokenPrice()).to.be.eq("8016");
      expect((await OZ.investment(user.address, 1)).tokens).to.be.eq(
        "87456293706"
      );
    });

    it("Reserving slot: Success, user tries to purchase a slot with less then 100$ investment and slot is reserved for him by admin", async () => {
      let user = signers[1];
      let user1 = signers[2];
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);
      await BUSD.connect(user).transfer(user.address, expandTo18Decimals(7000));
      await BUSD.connect(user).approve(OZ.address, expandTo18Decimals(7000));
      // await OZ.connect(owner).completeKYC(owner.address, user.address,true);
      await OZ.connect(owner).slotReservedByAdmin(user.address, 0);
      await OZ.connect(user).purchaseTokens(
        expandTo30Decimals(99),
        BUSD.address,
        user1.address
      );
      expect((await OZ.users(user.address)).referrer).to.be.eq(owner.address);
      expect((await OZ.users(user.address)).investmentCounter).to.be.eq(1);
      expect((await OZ.users(user.address)).tokenPrice).to.be.eq("8");
    });

    it("Reserving slot: Success, if owner reserves a slot for a user, and user tries to purchase tokens at same price", async () => {
      let user = signers[1];
      let user1 = signers[2];
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      await OZ.connect(owner).addToken(BUSD.address);
      await BUSD.connect(user).transfer(user.address, expandTo18Decimals(7000));
      await BUSD.connect(user).approve(OZ.address, expandTo18Decimals(7000));
      // await OZ.connect(owner).completeKYC(owner.address, user.address,true);
      await OZ.connect(owner).slotReservedByAdmin(user.address, 0);
      expect((await OZ.users(user.address)).mintedOnce).to.be.eq(true);
      expect((await OZ.users(user.address)).tokenPrice).to.be.eq("8");
      await OZ.connect(user).purchaseTokens(
        expandTo30Decimals(100),
        BUSD.address,
        user1.address
      );
      expect((await OZ.users(user.address)).mintedOnce).to.be.eq(false);
      expect((await OZ.users(user.address)).investmentCounter).to.be.eq(1);
      expect((await OZ.users(user.address)).tokenPrice).to.be.eq("8");
      expect(await OZT.balanceOf(OZ.address)).to.be.eq("43750000000000");
      expect(await OZ.currentTokenPrice()).to.be.eq("8000");
      expect((await OZ.investment(user.address, 1)).tokens).to.be.eq(
        "1250000000000"
      );
      expect((await OZ.users(user.address)).investedDollars).to.be.eq(
        expandTo12Decimals(100)
      );
      await OZ.connect(user).purchaseTokens(
        expandTo30Decimals(100),
        BUSD.address,
        user1.address
      );
      expect((await OZ.users(user.address)).investmentCounter).to.be.eq(2);
      expect((await OZ.users(user.address)).tokenPrice).to.be.eq("8");
      expect(await OZT.balanceOf(OZ.address)).to.be.eq("43750000000000");
      expect(await OZ.currentTokenPrice()).to.be.eq("8000");
      expect((await OZ.investment(user.address, 2)).tokens).to.be.eq(
        "1250000000000"
      );
      expect((await OZ.users(user.address)).investedDollars).to.be.eq(
        expandTo12Decimals(200)
      );
    });
  });

  describe("Sell OZ token", async () => {
    it("Selling Tokens : Fail, tokens are of worth more then 3500$ and is not multiple of 3500$", async () => {
      let user = signers[2];
      let user2 = signers[3];
      let user3 = signers[4];
      BUSD = await new BUSD__factory(user).deploy("BUSD", "BUSD");
      USDT = await new USDT__factory(user).deploy("USDT", "USDT");
      await OZ.connect(owner).addToken(BUSD.address);
      await OZ.connect(owner).addToken(USDT.address);
      await BUSD.connect(user).transfer(
        user2.address,
        expandTo18Decimals(14000)
      );

      await USDT.connect(user).transfer(
        user3.address,
        expandTo6Decimals(14000)
      );
      expect(await OZT.balanceOf(OZ.address)).to.be.eq("0");

      await BUSD.connect(user2).approve(OZ.address, expandTo18Decimals(14000));
      await USDT.connect(user3).approve(OZ.address, expandTo6Decimals(14000));
      await OZ.connect(user2).purchaseTokens(
        expandTo30Decimals(14000),
        BUSD.address,
        owner.address
      );
      await mineBlocks(ethers.provider, 5100);
      await OZ.connect(user2).dripWithdrawal(1);
      await expect(
        OZ.connect(user2).sellToken(
          [`${BUSD.address}`],
          [expandTo30Decimals(7100)],
          0
        )
      ).to.be.revertedWith(
        "OZV0 : Selling only allowed for less then 3500$ or for multiple of 3500$"
      );
    });
  });
});
