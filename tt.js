const fs = require("fs");
const { RuntimeArgs, CLValueBuilder, Contracts, CasperClient, Keys, CLPublicKey, CLURef, Signer, CasperServiceByJsonRPC, CLAccountHash } = require("casper-js-sdk");
const { BN } = require("bn.js");
const client = new CasperClient("https://rpc.testnet.casperlabs.io/rpc");

const wasm = new Uint8Array(fs.readFileSync("timeable_mergeable_nft.wasm"));

const keys = Keys.Secp256K1.loadKeyPairFromPrivateFile("test.pem");

const contract = new Contracts.Contract(client);

const contractHash = "hash-f4fba7c6ae2191cba0c1f96e0e69d3e7dc6e4185b14df6bf6cbc843eed72a18a";
const collectionHash = "e0d6998abd17eed38a0a04dd4b09c34488bf19f929b782a1dcc9116afa214500";

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

  const deploy = contract.install(wasm, args, "100000000000", keys.publicKey, "casper-test", [keys]);

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
    owner: CLValueBuilder.key(CLPublicKey.fromHex("0203a5199a525ec47b3cb21708e7fd3f3bbf42e1a31b7dcd39a739b578ee292491ad")),
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
    token_id: CLValueBuilder.u64(0),
  });

  const deploy = contract.callEntrypoint("burn", args, keys.publicKey, "casper-test", "6000000000", [keys]);

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
    collection: CasperHelpers.stringToKey(contractHash.slice(5)),
  });

  const deploy = contract.callEntrypoint("whitelist", args, keys.publicKey, "casper-test", "4000000000", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

// install();

// mint();

burn();
