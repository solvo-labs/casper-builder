const fs = require("fs");
const { RuntimeArgs, CLValueBuilder, Contracts, CasperClient, Keys, CLPublicKey, CLURef, Signer, CasperServiceByJsonRPC, CLAccountHash, CLByteArray } = require("casper-js-sdk");
const { BN } = require("bn.js");
const client = new CasperClient("https://rpc.testnet.casperlabs.io/rpc");

const wasm = new Uint8Array(fs.readFileSync("mkp.wasm"));
const wasm2 = new Uint8Array(fs.readFileSync("execute_listing_call.wasm"));

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

async function install() {
  const pubkey = "01eb27dfe3cd9493c266a25f0ebd70f64fa99e26b12bd48645868286e394dff022";

  const receipent = CLPublicKey.fromHex(pubkey);
  const args = RuntimeArgs.fromMap({
    fee_wallet: CLValueBuilder.key(receipent),
    contract_name: CLValueBuilder.string("test_4567"),
  });

  const deploy = contract.install(wasm, args, "150000000000", keys.publicKey, "casper-test", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
}

async function install2() {
  const pubkey = "803f95e1be880c6d2c11a82ed3b727a9acdb4e53d00c2b17e80a01bc2e0b9900";

  const receipent = CLPublicKey.fromHex(pubkey);
  const args = RuntimeArgs.fromMap({
    amount: CLValueBuilder.u512(100000000000),
    marketplace_contract_hash: CLValueBuilder.key(receipent),
    listing_id: CLValueBuilder.u256(0),
  });

  const deploy = contract.install(wasm, args, "150000000000", keys.publicKey, "casper-test", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
}

async function add_listing() {
  contract.setContractHash("hash-803f95e1be880c6d2c11a82ed3b727a9acdb4e53d00c2b17e80a01bc2e0b9900");

  const args = RuntimeArgs.fromMap({
    collection: CasperHelpers.stringToKey("b1acd833758036848ff21448621e9a545af5e96c9a6bf27a4103d59bb925867f"),
    token_id: CLValueBuilder.u256(0),
    price: CLValueBuilder.u256(10000),
  });

  const deploy = contract.callEntrypoint("add_listing", args, keys.publicKey, "casper-test", "6000000000", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
}
// install2();
// const data = keys.accountHash().toString();

// add_listing();

// install();

const test = async () => {
  const x = await client.getDeploy("a13b62f8d844b8e983cfa8a8027d3904a528a339c096c9573fb0ff2fc7695f18");
  const y = await client.nodeClient.getDeployInfo("a13b62f8d844b8e983cfa8a8027d3904a528a339c096c9573fb0ff2fc7695f18");
};
test();
