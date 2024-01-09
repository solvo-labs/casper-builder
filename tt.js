const fs = require("fs");
const {
  RuntimeArgs,
  CLValueBuilder,
  Contracts,
  CLKey,
  CasperClient,
  Keys,
  CLPublicKey,
  CLURef,
  CLByteArray,
  Signer,
  CasperServiceByJsonRPC,
  CLAccountHash,
} = require("casper-js-sdk");
const { BN } = require("bn.js");
const client = new CasperClient("https://rpc.testnet.casperlabs.io/rpc");

const wasm = new Uint8Array(fs.readFileSync("timeable_mergeable_nft.wasm"));
const wasmDeposit = new Uint8Array(fs.readFileSync("timeable_nft_deposit.wasm"));

const keys = Keys.Secp256K1.loadKeyPairFromPrivateFile("test.pem");
const yedek = Keys.Secp256K1.loadKeyPairFromPrivateFile("yedek_secret_key.pem");

const contract = new Contracts.Contract(client);

const contractHash = "hash-57be357db62126e70bbe7090731c725e81d32c7a6b929a3ce0403ced199ef7a8";
const collectionHash = "4ffb1a5a172f82febd1b7fe051aa07989014fe416fb22e20fcc8c1e3361f357d";

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

async function install() {
  const args = RuntimeArgs.fromMap({
    fee_wallet: CLValueBuilder.key(CLPublicKey.fromHex("02026d9f5d2a12737c06d0658f6bfdd6e1c06ef9fad959effa72f81143f4dd20635b")),
  });

  const deploy = contract.install(wasm, args, "140000000000", keys.publicKey, "casper-test", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
}

const mint = async () => {
  contract.setContractHash(contractHash);

  const args = RuntimeArgs.fromMap({
    collection: CasperHelpers.stringToKey(collectionHash),
    // owner: CLValueBuilder.key(CLPublicKey.fromHex("0203a5199a525ec47b3cb21708e7fd3f3bbf42e1a31b7dcd39a739b578ee292491ad")),
    metadata: CLValueBuilder.string(JSON.stringify({ name: "123", description: "32432432", asset: "string" })),
  });

  const deploy = contract.callEntrypoint("mint", args, keys.publicKey, "casper-test", "6000000000", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

const burn = async () => {
  contract.setContractHash(contractHash);

  const args = RuntimeArgs.fromMap({
    collection: CasperHelpers.stringToKey(collectionHash),
    token_id: CLValueBuilder.u64(4),
  });

  const deploy = contract.callEntrypoint("burn", args, yedek.publicKey, "casper-test", "6000000000", [yedek]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

const approveForAll = async () => {
  // collection hash
  contract.setContractHash("hash-" + collectionHash);

  const args = RuntimeArgs.fromMap({
    token_owner: CLValueBuilder.key(CLPublicKey.fromHex("0203752bf98c82f2705c6ca16d445d7d9bd2bc552880d19a66cd925008bae5a6c0dc")),
    approve_all: CLValueBuilder.bool(true),
    operator: new CLKey(new CLByteArray(Uint8Array.from(Buffer.from(contractHash.slice(5), "hex")))),
  });

  const deploy = contract.callEntrypoint("set_approval_for_all", args, keys.publicKey, "casper-test", "4000000000", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

const merge = async () => {
  contract.setContractHash(contractHash);

  const args = RuntimeArgs.fromMap({
    collection: CasperHelpers.stringToKey(collectionHash),
    token_ids: CLValueBuilder.list([CLValueBuilder.u64(9), CLValueBuilder.u64(10)]),
  });

  const deploy = contract.callEntrypoint("merge", args, keys.publicKey, "casper-test", "14000000000", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

const approve = async () => {
  // collection hash
  contract.setContractHash("hash-" + collectionHash);

  // operator = Raffle Contract hash
  const args = RuntimeArgs.fromMap({
    operator: new CLKey(new CLByteArray(Uint8Array.from(Buffer.from(contractHash.slice(5), "hex")))),
    // operator: new CLKey(new CLByteArray(Uint8Array.from(Buffer.from("02026d9f5d2a12737c06d0658f6bfdd6e1c06ef9fad959effa72f81143f4dd20635b", "hex")))),
    // operator: CLValueBuilder.key(yedek.publicKey),
    token_id: CLValueBuilder.u64(19),
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

const mint_timeable_nft = async () => {
  contract.setContractHash(contractHash);

  const args = RuntimeArgs.fromMap({
    collection: CasperHelpers.stringToKey(collectionHash),
    metadata: CLValueBuilder.string(JSON.stringify({ name: "test12345", description: "bbbbb", asset: "cccccc", timeable: true, timestamp: 1701082495000 })),
  });

  const deploy = contract.callEntrypoint("mint_timeable_nft", args, keys.publicKey, "casper-test", "15000000000", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

const burn_timeable_nft = async () => {
  contract.setContractHash(contractHash);

  const args = RuntimeArgs.fromMap({});

  const deploy = contract.callEntrypoint("burn_timeable_nft", args, yedek.publicKey, "casper-test", "15000000000", [yedek]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

const register_owner = async () => {
  contract.setContractHash("hash-" + collectionHash);

  const args = RuntimeArgs.fromMap({
    token_owner: CLValueBuilder.key(yedek.publicKey),
    // token_owner: CLValueBuilder.key(CLPublicKey.fromHex("02026d9f5d2a12737c06d0658f6bfdd6e1c06ef9fad959effa72f81143f4dd20635b")),
  });

  const deploy = contract.callEntrypoint("register_owner", args, keys.publicKey, "casper-test", "15000000000", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

async function pay() {
  const args = RuntimeArgs.fromMap({
    amount: CLValueBuilder.u512(5 * 1_000_000_000),
    nft_contract_hash: new CLAccountHash(Buffer.from(contractHash.slice(5), "hex")),
    collection: CasperHelpers.stringToKey(collectionHash),
    metadata: CLValueBuilder.string(JSON.stringify({ name: Math.random().toString(), description: "bbbbb", asset: "cccccc", timeable: true, timestamp: 1701699477000 })),
    // target_address: CLValueBuilder.key(CLPublicKey.fromHex("020343b6620c012fd347d542e30ec07b2c9ff90a6871e5dcb77f7b51124a9863eeb8")),
  });

  const deploy = contract.install(wasmDeposit, args, "20000000000", keys.publicKey, "casper-test", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
}

const fetchData = async () => {
  contract.setContractHash(contractHash);

  const data = await contract.queryContractDictionary("timeable_nfts", "5");

  console.log(data);
};

const transfer = async () => {
  contract.setContractHash(contractHash);

  const args = RuntimeArgs.fromMap({
    collection: CasperHelpers.stringToKey(collectionHash),
    source: CLValueBuilder.key(CLPublicKey.fromHex("0203752bf98c82f2705c6ca16d445d7d9bd2bc552880d19a66cd925008bae5a6c0dc")),
    target: CLValueBuilder.key(CLPublicKey.fromHex("0203f6b43e33cfbaf54bcf3c6f817ad67781eee9b40478677245a7f834388204800b")),
    token_id: CLValueBuilder.u64(4),
  });

  const deploy = contract.callEntrypoint("transfer", args, keys.publicKey, "casper-test", "30000000000", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

// install();
// approve();

// mint();

// approveForAll();

// merge();
// burn();

// register_owner();

burn_timeable_nft();
// pay();

// fetchData();

// transfer();
