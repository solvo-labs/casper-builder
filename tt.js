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

const keys = Keys.Secp256K1.loadKeyPairFromPrivateFile("test.pem");
const yedek = Keys.Secp256K1.loadKeyPairFromPrivateFile("yedek_secret_key.pem");

const contract = new Contracts.Contract(client);

const contractHash = "hash-0fd47c1f089cdec3be2e7d02080ea808712f8124826a97f43e51f9f33f87ca2d";
const collectionHash = "7b2d024342b45a40f663503f358ba1532c507ec5ab2db1becc61ba1b88771a32";

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
  const args = RuntimeArgs.fromMap({});

  const deploy = contract.install(wasm, args, "120000000000", keys.publicKey, "casper-test", [keys]);

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
    token_id: CLValueBuilder.u64(0),
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
    metadata: CLValueBuilder.string(JSON.stringify({ name: "test", description: "bbbbb", asset: "cccccc", timeable: true, mergable: false, timestamp: 1701082495000 })),
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

  const deploy = contract.callEntrypoint("burn_timeable_nft", args, yedek.publicKey, "casper-test", "25000000000", [yedek]);

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
    token_owner: CLValueBuilder.key(CLPublicKey.fromHex("0203752bf98c82f2705c6ca16d445d7d9bd2bc552880d19a66cd925008bae5a6c0dc")),
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

// install();

// mint_timeable_nft();

// approve();

// mint();

// approveForAll();

// merge();
// burn();

// register_owner();

burn_timeable_nft();
