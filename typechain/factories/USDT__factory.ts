/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";

import type { USDT } from "../USDT";

export class USDT__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    tokenName: string,
    tokenSymbol: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<USDT> {
    return super.deploy(
      tokenName,
      tokenSymbol,
      overrides || {}
    ) as Promise<USDT>;
  }
  getDeployTransaction(
    tokenName: string,
    tokenSymbol: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(tokenName, tokenSymbol, overrides || {});
  }
  attach(address: string): USDT {
    return super.attach(address) as USDT;
  }
  connect(signer: Signer): USDT__factory {
    return super.connect(signer) as USDT__factory;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): USDT {
    return new Contract(address, _abi, signerOrProvider) as USDT;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "tokenName",
        type: "string",
      },
      {
        internalType: "string",
        name: "tokenSymbol",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b5060405162000f5738038062000f578339810160408190526200003491620002d8565b8151829082906200004d90600390602085019062000187565b5080516200006390600490602084019062000187565b505050620000a1336200007b620000a960201b60201c565b6200008b9060ff16600a620003e7565b6200009b906302faf080620004dc565b620000ae565b505062000567565b600690565b6001600160a01b038216620000e05760405162461bcd60e51b8152600401620000d7906200033f565b60405180910390fd5b620000ee6000838362000182565b80600260008282546200010291906200037f565b90915550506001600160a01b03821660009081526020819052604081208054839290620001319084906200037f565b90915550506040516001600160a01b038316906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef906200017690859062000376565b60405180910390a35050565b505050565b8280546200019590620004fe565b90600052602060002090601f016020900481019282620001b9576000855562000204565b82601f10620001d457805160ff191683800117855562000204565b8280016001018555821562000204579182015b8281111562000204578251825591602001919060010190620001e7565b506200021292915062000216565b5090565b5b8082111562000212576000815560010162000217565b600082601f8301126200023e578081fd5b81516001600160401b03808211156200025b576200025b62000551565b6040516020601f8401601f191682018101838111838210171562000283576200028362000551565b60405283825285840181018710156200029a578485fd5b8492505b83831015620002bd57858301810151828401820152918201916200029e565b83831115620002ce57848185840101525b5095945050505050565b60008060408385031215620002eb578182fd5b82516001600160401b038082111562000302578384fd5b62000310868387016200022d565b9350602085015191508082111562000326578283fd5b5062000335858286016200022d565b9150509250929050565b6020808252601f908201527f45524332303a206d696e7420746f20746865207a65726f206164647265737300604082015260600190565b90815260200190565b600082198211156200039557620003956200053b565b500190565b80825b6001808611620003ae5750620003de565b818704821115620003c357620003c36200053b565b80861615620003d157918102915b9490941c9380026200039d565b94509492505050565b6000620003f86000198484620003ff565b9392505050565b6000826200041057506001620003f8565b816200041f57506000620003f8565b8160018114620004385760028114620004435762000477565b6001915050620003f8565b60ff8411156200045757620004576200053b565b6001841b9150848211156200047057620004706200053b565b50620003f8565b5060208310610133831016604e8410600b8410161715620004af575081810a83811115620004a957620004a96200053b565b620003f8565b620004be84848460016200039a565b808604821115620004d357620004d36200053b565b02949350505050565b6000816000190483118215151615620004f957620004f96200053b565b500290565b6002810460018216806200051357607f821691505b602082108114156200053557634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052604160045260246000fd5b6109e080620005776000396000f3fe608060405234801561001057600080fd5b50600436106100a95760003560e01c80633950935111610071578063395093511461012957806370a082311461013c57806395d89b411461014f578063a457c2d714610157578063a9059cbb1461016a578063dd62ed3e1461017d576100a9565b806306fdde03146100ae578063095ea7b3146100cc57806318160ddd146100ec57806323b872dd14610101578063313ce56714610114575b600080fd5b6100b6610190565b6040516100c391906106df565b60405180910390f35b6100df6100da3660046106ab565b610222565b6040516100c391906106d4565b6100f461023f565b6040516100c39190610913565b6100df61010f366004610670565b610245565b61011c6102e5565b6040516100c3919061091c565b6100df6101373660046106ab565b6102ea565b6100f461014a36600461061d565b610339565b6100b6610358565b6100df6101653660046106ab565b610367565b6100df6101783660046106ab565b6103e2565b6100f461018b36600461063e565b6103f6565b60606003805461019f90610959565b80601f01602080910402602001604051908101604052809291908181526020018280546101cb90610959565b80156102185780601f106101ed57610100808354040283529160200191610218565b820191906000526020600020905b8154815290600101906020018083116101fb57829003601f168201915b5050505050905090565b600061023661022f610421565b8484610425565b50600192915050565b60025490565b60006102528484846104d9565b6001600160a01b038416600090815260016020526040812081610273610421565b6001600160a01b03166001600160a01b03168152602001908152602001600020549050828110156102bf5760405162461bcd60e51b81526004016102b6906107fd565b60405180910390fd5b6102da856102cb610421565b6102d58685610942565b610425565b506001949350505050565b600690565b60006102366102f7610421565b848460016000610305610421565b6001600160a01b03908116825260208083019390935260409182016000908120918b16815292529020546102d5919061092a565b6001600160a01b0381166000908152602081905260409020545b919050565b60606004805461019f90610959565b60008060016000610376610421565b6001600160a01b03908116825260208083019390935260409182016000908120918816815292529020549050828110156103c25760405162461bcd60e51b81526004016102b6906108ce565b6103d86103cd610421565b856102d58685610942565b5060019392505050565b60006102366103ef610421565b84846104d9565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b3390565b6001600160a01b03831661044b5760405162461bcd60e51b81526004016102b69061088a565b6001600160a01b0382166104715760405162461bcd60e51b81526004016102b690610775565b6001600160a01b0380841660008181526001602090815260408083209487168084529490915290819020849055517f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925906104cc908590610913565b60405180910390a3505050565b6001600160a01b0383166104ff5760405162461bcd60e51b81526004016102b690610845565b6001600160a01b0382166105255760405162461bcd60e51b81526004016102b690610732565b610530838383610601565b6001600160a01b038316600090815260208190526040902054818110156105695760405162461bcd60e51b81526004016102b6906107b7565b6105738282610942565b6001600160a01b0380861660009081526020819052604080822093909355908516815290812080548492906105a990849061092a565b92505081905550826001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516105f39190610913565b60405180910390a350505050565b505050565b80356001600160a01b038116811461035357600080fd5b60006020828403121561062e578081fd5b61063782610606565b9392505050565b60008060408385031215610650578081fd5b61065983610606565b915061066760208401610606565b90509250929050565b600080600060608486031215610684578081fd5b61068d84610606565b925061069b60208501610606565b9150604084013590509250925092565b600080604083850312156106bd578182fd5b6106c683610606565b946020939093013593505050565b901515815260200190565b6000602080835283518082850152825b8181101561070b578581018301518582016040015282016106ef565b8181111561071c5783604083870101525b50601f01601f1916929092016040019392505050565b60208082526023908201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260408201526265737360e81b606082015260800190565b60208082526022908201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604082015261737360f01b606082015260800190565b60208082526026908201527f45524332303a207472616e7366657220616d6f756e7420657863656564732062604082015265616c616e636560d01b606082015260800190565b60208082526028908201527f45524332303a207472616e7366657220616d6f756e74206578636565647320616040820152676c6c6f77616e636560c01b606082015260800190565b60208082526025908201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604082015264647265737360d81b606082015260800190565b60208082526024908201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646040820152637265737360e01b606082015260800190565b60208082526025908201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f77604082015264207a65726f60d81b606082015260800190565b90815260200190565b60ff91909116815260200190565b6000821982111561093d5761093d610994565b500190565b60008282101561095457610954610994565b500390565b60028104600182168061096d57607f821691505b6020821081141561098e57634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052601160045260246000fdfea2646970667358221220cc10767bf10a2ddc05f1c58e486d98307c03e6c8dd7a9a8cc3259cd23df45a1c64736f6c63430008000033";