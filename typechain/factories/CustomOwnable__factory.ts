/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";

import type { CustomOwnable } from "../CustomOwnable";

export class CustomOwnable__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<CustomOwnable> {
    return super.deploy(overrides || {}) as Promise<CustomOwnable>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): CustomOwnable {
    return super.attach(address) as CustomOwnable;
  }
  connect(signer: Signer): CustomOwnable__factory {
    return super.connect(signer) as CustomOwnable__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): CustomOwnable {
    return new Contract(address, _abi, signerOrProvider) as CustomOwnable;
  }
}

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5061001a3361001f565b610041565b600080546001600160a01b0319166001600160a01b0392909216919091179055565b61021b806100506000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80638da5cb5b1461003b578063f2fde38b14610059575b600080fd5b61004361006e565b6040516100509190610180565b60405180910390f35b61006c610067366004610152565b61007d565b005b6000546001600160a01b031690565b61008561006e565b6001600160a01b0316336001600160a01b0316146100be5760405162461bcd60e51b81526004016100b5906101ae565b60405180910390fd5b6001600160a01b0381166100e45760405162461bcd60e51b81526004016100b5906101ae565b7f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e061010d61006e565b8260405161011c929190610194565b60405180910390a161012d81610130565b50565b600080546001600160a01b0319166001600160a01b0392909216919091179055565b600060208284031215610163578081fd5b81356001600160a01b0381168114610179578182fd5b9392505050565b6001600160a01b0391909116815260200190565b6001600160a01b0392831681529116602082015260400190565b60208082526018908201527f437573746f6d4f776e61626c653a20464f5242494444454e000000000000000060408201526060019056fea2646970667358221220c667f11a5420e50c693363b6907537037bd14222650e4ebfb72ac1806feefe2d64736f6c63430008000033";
