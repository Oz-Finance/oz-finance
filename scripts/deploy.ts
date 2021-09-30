import {
  OZV0,
  OZV0__factory,
  OwnedUpgradeabilityProxy,
  OwnedUpgradeabilityProxy__factory,
  BUSD__factory,
  USDT__factory,
  OZT__factory,
} from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";
let impl: OZV0;
let OZ: OZV0;
let owner: SignerWithAddress;
let signers: SignerWithAddress[];
let proxy: OwnedUpgradeabilityProxy;
let USDT: any;
let BUSD: any;

async function main() {
  let OZT: any;
  signers = await ethers.getSigners();
  owner = signers[0];
  console.log(owner.address);

  proxy = await new OwnedUpgradeabilityProxy__factory(owner).deploy();
  impl = await new OZV0__factory(owner).deploy();
  OZ = await new OZV0__factory(owner).attach(proxy.address);
  OZT = await new OZT__factory(owner).deploy("OZToken", "OZT");
  USDT = await new USDT__factory(owner).deploy("USDT", "USDT");
  BUSD = await new BUSD__factory(owner).deploy("BUSD", "BUSD");
  const initializeData = impl.interface.encodeFunctionData("initialize", [
    "0xba0d7cb4f4fb1bbbaa4e973a7fedb878bf5ce02f",
    OZT.address,
    "0xba0d7cb4f4fb1bbbaa4e973a7fedb878bf5ce02f",
  ]);

  await proxy.upgradeToAndCall(impl.address, initializeData);

  console.log("Implementation deployed on : ", impl.address);
  console.log("USDT deployed on : ", USDT.address);
  console.log("BUSD deployed on : ", BUSD.address);
  console.log("OZT deployed on : ", OZT.address);
  console.log("Proxy deployed on : ", proxy.address);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
