/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  Contract,
  ContractTransaction,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import { TypedEventFilter, TypedEvent, TypedListener } from "./commons";

interface OZV0EventsInterface extends ethers.utils.Interface {
  functions: {};

  events: {
    "BonusAllocation(address,uint256,uint256,uint256,uint256,uint256,uint256)": EventFragment;
    "DripWithdrawal(address,uint32,uint256,uint256)": EventFragment;
    "FlashSale(address,address,uint256,uint256,uint256,uint256,uint256,uint256)": EventFragment;
    "PurchaseTokens(address,uint256,uint32,uint256,bool,uint256,uint256,bool,uint256,uint256)": EventFragment;
    "ReffralIncome(address,address,uint256,uint256,uint256,uint256)": EventFragment;
    "Registration(address,address,uint256,uint256,uint256,bool)": EventFragment;
    "SellToken(address,uint256,uint256,uint256,uint256,uint256)": EventFragment;
    "SlotReservedByAdmin(address,uint256,uint256,uint256,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "BonusAllocation"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "DripWithdrawal"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "FlashSale"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "PurchaseTokens"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ReffralIncome"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Registration"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SellToken"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SlotReservedByAdmin"): EventFragment;
}

export class OZV0Events extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: OZV0EventsInterface;

  functions: {};

  callStatic: {};

  filters: {
    BonusAllocation(
      user: null,
      price: null,
      token: null,
      time: null,
      investment: null,
      decimalFactor: null,
      investmentCounter: null
    ): TypedEventFilter<
      [
        string,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber
      ],
      {
        user: string;
        price: BigNumber;
        token: BigNumber;
        time: BigNumber;
        investment: BigNumber;
        decimalFactor: BigNumber;
        investmentCounter: BigNumber;
      }
    >;

    DripWithdrawal(
      user: null,
      investmentCounter: null,
      tokens: null,
      time: null
    ): TypedEventFilter<
      [string, number, BigNumber, BigNumber],
      {
        user: string;
        investmentCounter: number;
        tokens: BigNumber;
        time: BigNumber;
      }
    >;

    FlashSale(
      seller: null,
      buyer: null,
      price: null,
      token: null,
      time: null,
      value: null,
      decimals: null,
      investmentCounter: null
    ): TypedEventFilter<
      [
        string,
        string,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber
      ],
      {
        seller: string;
        buyer: string;
        price: BigNumber;
        token: BigNumber;
        time: BigNumber;
        value: BigNumber;
        decimals: BigNumber;
        investmentCounter: BigNumber;
      }
    >;

    PurchaseTokens(
      userAddress: string | null,
      tokens: null,
      investmentCounter: null,
      time: null,
      isReserved: null,
      tokenPrice: null,
      investedDollars: null,
      sellOnCurrentPrice: null,
      decimalFactor: null,
      currentPrice: null
    ): TypedEventFilter<
      [
        string,
        BigNumber,
        number,
        BigNumber,
        boolean,
        BigNumber,
        BigNumber,
        boolean,
        BigNumber,
        BigNumber
      ],
      {
        userAddress: string;
        tokens: BigNumber;
        investmentCounter: number;
        time: BigNumber;
        isReserved: boolean;
        tokenPrice: BigNumber;
        investedDollars: BigNumber;
        sellOnCurrentPrice: boolean;
        decimalFactor: BigNumber;
        currentPrice: BigNumber;
      }
    >;

    ReffralIncome(
      user: null,
      reffralAddress: null,
      reffralIncome: null,
      ozOperationIncome: null,
      decimalFactor: null,
      time: null
    ): TypedEventFilter<
      [string, string, BigNumber, BigNumber, BigNumber, BigNumber],
      {
        user: string;
        reffralAddress: string;
        reffralIncome: BigNumber;
        ozOperationIncome: BigNumber;
        decimalFactor: BigNumber;
        time: BigNumber;
      }
    >;

    Registration(
      userAddress: string | null,
      referrerAddress: string | null,
      userId: null,
      referrerId: null,
      time: null,
      isKYC: null
    ): TypedEventFilter<
      [string, string, BigNumber, BigNumber, BigNumber, boolean],
      {
        userAddress: string;
        referrerAddress: string;
        userId: BigNumber;
        referrerId: BigNumber;
        time: BigNumber;
        isKYC: boolean;
      }
    >;

    SellToken(
      buyer: null,
      tokens: null,
      price: null,
      time: null,
      investmentCounter: null,
      currentPrice: null
    ): TypedEventFilter<
      [string, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber],
      {
        buyer: string;
        tokens: BigNumber;
        price: BigNumber;
        time: BigNumber;
        investmentCounter: BigNumber;
        currentPrice: BigNumber;
      }
    >;

    SlotReservedByAdmin(
      user: null,
      userType: null,
      price: null,
      timeStamp: null,
      blockNumber: null
    ): TypedEventFilter<
      [string, BigNumber, BigNumber, BigNumber, BigNumber],
      {
        user: string;
        userType: BigNumber;
        price: BigNumber;
        timeStamp: BigNumber;
        blockNumber: BigNumber;
      }
    >;
  };

  estimateGas: {};

  populateTransaction: {};
}
