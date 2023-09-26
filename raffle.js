const fs = require("fs");
const {
  RuntimeArgs,
  CLValueBuilder,
  Contracts,
  CasperClient,
  Keys,
  CLPublicKey,
  CLURef,
  Signer,
  CLKey,
  CasperServiceByJsonRPC,
  CLAccountHash,
  CLByteArray,
  AccessRights,
} = require("casper-js-sdk");
const { BN } = require("bn.js");
const client = new CasperClient("https://rpc.testnet.casperlabs.io/rpc");

const raffleWasm = new Uint8Array(fs.readFileSync("raffle.wasm"));
const buyTicketWasm = new Uint8Array(fs.readFileSync("raffle_deposit.wasm"));

const keys = Keys.Ed25519.loadKeyPairFromPrivateFile("test.pem");

const contract = new Contracts.Contract(client);

class CasperHelpers {
  static stringToKey(string) {
    return CLValueBuilder.key(this.stringToKeyParameter(string));
  }

  static stringToKeyParameter(string) {
    return CLValueBuilder.byteArray(this.convertHashStrToHashBuff(string));
  }

  static convertHashStrToHashBuff(hashStr) {
    let hashHex = hashStr;
    if (hashStr.startsWith("hash-")) {
      hashHex = hashStr.slice(5);
    }
    return Buffer.from(hashHex, "hex");
  }
}

// let raffle_name: String = runtime::get_named_arg(RAFFLE_NAME);
// let start_date: u64 = runtime::get_named_arg(START_DATE);
// let end_date: u64 = runtime::get_named_arg(END_DATE);
// let collection_id: String = runtime::get_named_arg(COLLECTION_ID);
// let nft_index: u64 = runtime::get_named_arg(NFT_INDEX);
// let price: U512 = runtime::get_named_arg(PRICE);

const collection = "2796ff3177e5c1883f0746971339e5a630c7d79715288c2512b5680cb3a1d19d";

async function install() {
  const args = RuntimeArgs.fromMap({
    name: CLValueBuilder.string("pencere"),
    start_date: CLValueBuilder.u64(Date.now()),
    end_date: CLValueBuilder.u64(Date.now() + 10000),
    collection: CasperHelpers.stringToKey(collection),
    nft_index: CLValueBuilder.u64(4),
    price: CLValueBuilder.u512(5 * 1_000_000_000),
  });

  const deploy = contract.install(raffleWasm, args, "100000000000", keys.publicKey, "casper-test", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
}

const approve = async () => {
  // collection hash
  contract.setContractHash("hash-" + collection);

  // operator = Raffle Contract hash
  const args = RuntimeArgs.fromMap({
    operator: new CLKey(new CLByteArray(Uint8Array.from(Buffer.from("d5b84ea8a79cbba4c15fd97b95164bd41d77cdcc2aeb3c2a6a2990fe96ad7919", "hex")))),
    token_id: CLValueBuilder.u64(4),
  });

  const deploy = contract.callEntrypoint("approve", args, keys.publicKey, "casper-test", "4000000000", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

// const init = async () => {
//   contract.setContractHash("hash-459f870b98e6725243e52dc75cad221ba979804bae5d95dafd7787d7fad44609");

//   const args = RuntimeArgs.fromMap({
//     collection: CasperHelpers.stringToKey(collection),
//     nft_index: CLValueBuilder.u64(0),
//   });

//   const deploy = contract.callEntrypoint("init", args, keys.publicKey, "casper-test", "6000000000", [keys]);

//   try {
//     const tx = await client.putDeploy(deploy);

//     console.log("tx", tx);
//   } catch (error) {
//     console.log("error", error);
//     return error;
//   }
// };

// runtime_args! {
//   "token_id" => token_id,
//   "source_key" => sender,
//   "target_key" => recipient,
// },

// const transfer = async () => {
//   contract.setContractHash("hash-2796ff3177e5c1883f0746971339e5a630c7d79715288c2512b5680cb3a1d19d");

//   const s = CLPublicKey.fromHex("01eb27dfe3cd9493c266a25f0ebd70f64fa99e26b12bd48645868286e394dff022");
//   const r = CLPublicKey.fromHex("0202dc2cd34ddc8142b4c24c0b4d93ac0be3e6fc4238c4ea19d7d928a7f74be1e884");

//   const args = RuntimeArgs.fromMap({
//     source_key: CLValueBuilder.key(s),
//     target_key: CasperHelpers.stringToKey("9ace447ee50a2668122f8a2224ec32ca266194a778b0d5738b5e3616100c4345"),
//     token_id: CLValueBuilder.u64(1),
//   });

//   const deploy = contract.callEntrypoint("transfer", args, keys.publicKey, "casper-test", "4000000000", [keys]);

//   try {
//     const tx = await client.putDeploy(deploy);

//     console.log("tx", tx);
//   } catch (error) {
//     console.log("error", error);
//     return error;
//   }
// };

//9ace447ee50a2668122f8a2224ec32ca266194a778b0d5738b5e3616100c4345

// transfer();

// approve();

// init();

const deposit = async () => {
  contract.setContractHash("hash-d5b84ea8a79cbba4c15fd97b95164bd41d77cdcc2aeb3c2a6a2990fe96ad7919");

  const args = RuntimeArgs.fromMap({});

  const deploy = contract.callEntrypoint("deposit", args, keys.publicKey, "casper-test", "6000000000", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

const getPrice = async () => {
  contract.setContractHash("hash-a6ff2dd9c973162d416fcafd6ef741d33d5d675691ee30412d710b47f97f7b89");

  const args = RuntimeArgs.fromMap({});

  const deploy = contract.callEntrypoint("get_price", args, keys.publicKey, "casper-test", "6000000000", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

const claim = async () => {
  contract.setContractHash("hash-12f7c231b2779fad13b0ac7ce14c31dddf907b3ff988a07aaf0dc079156d076a");

  const args = RuntimeArgs.fromMap({});

  const deploy = contract.callEntrypoint("claim", args, keys.publicKey, "casper-test", "6000000000", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

const buy_ticket = async () => {
  contract.setContractHash("hash-af1d6757625225b380cd134056aa111233e598725dd72d65de1990486475e828");

  const args = RuntimeArgs.fromMap({
    my_purse: CLValueBuilder.uref(Uint8Array.from(Buffer.from("55ceec3bc3150ad5be1f2eeaab39a4dd984c626ff9dd00157b123b2c5e97ac86", "hex")), AccessRights.READ_WRITE),
  });

  const deploy = contract.callEntrypoint("buy_ticket", args, keys.publicKey, "casper-test", "6000000000", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

async function buy_install() {
  const contract2 = new Contracts.Contract(client);

  const args = RuntimeArgs.fromMap({
    // raffle_contract_hash: CasperHelpers.stringToKey("61b408af2f990fc16476e93bcdc6727e2b79879f3abded73e64ae4dff39e46cd"),
    raffle_contract_hash: new CLAccountHash(Buffer.from("d5b84ea8a79cbba4c15fd97b95164bd41d77cdcc2aeb3c2a6a2990fe96ad7919", "hex")),
    amount: CLValueBuilder.u512(5 * 1_000_000_000),
  });

  const deploy = contract2.install(buyTicketWasm, args, "10000000000", keys.publicKey, "casper-test", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
}

// Step 1 - Create Raffle (Admin)
// install();

// Step 2 - Approve for Raffle Contract from CEP78 Contract (Admin)
// approve();

// Step 3 - Deposit Owner nft to contract (Admin)
// deposit();

// Step 4 - Buy ticket for Raffle (User)
// buy_install();
