const fs = require("fs");
const { RuntimeArgs, CLValueBuilder, Contracts, CasperClient, Keys, CLPublicKey, CLURef, Signer, CasperServiceByJsonRPC, CLAccountHash, CLByteArray } = require("casper-js-sdk");
const { BN } = require("bn.js");
const client = new CasperClient("https://rpc.testnet.casperlabs.io/rpc");

const vestingWasm = new Uint8Array(fs.readFileSync("contract.wasm"));

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
  const args = RuntimeArgs.fromMap({
    // contract: CasperHelpers.stringToKey(token),
    // to: CLValueBuilder.key(receipent),
    // amount: CLValueBuilder.u256(11000000),
  });

  const deploy = contract.install(vestingWasm, args, "150000000000", keys.publicKey, "casper-test", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
}

async function lock() {
  contract.setContractHash("hash-c422ddb26c5617f95c9f7fb0fb35a3b1f23cb8d7555a84a54d8798b12e52614c");
  const recipentPubKey = CLPublicKey.fromHex("0202dc2cd34ddc8142b4c24c0b4d93ac0be3e6fc4238c4ea19d7d928a7f74be1e884");

  const args = RuntimeArgs.fromMap({
    cliff_utimestamp: CLValueBuilder.u64(Date.now() + 1000000),
    cliff_durtime: CLValueBuilder.u64(1200000),
    cliff_amount: CLValueBuilder.u256(10005),
    unit_time: CLValueBuilder.u64(1200000),
    recipient: CLValueBuilder.string(recipentPubKey.toAccountHashStr().toString()),
    "token-hash": CLValueBuilder.string("contract-ad2832dbb0d7bfdd8acc3d201aaf0a81d3897aa2664cc8b7094f2858452c9716"),
  });

  const deploy = contract.callEntrypoint("lock", args, keys.publicKey, "casper-test", "10000000000", [keys]);

  try {
    return await client.putDeploy(deploy);
  } catch (error) {
    return error;
  }
}

async function init() {
  contract.setContractHash("hash-c422ddb26c5617f95c9f7fb0fb35a3b1f23cb8d7555a84a54d8798b12e52614c");

  const args = RuntimeArgs.fromMap({
    // cliff_utimestamp: CLValueBuilder.u64(0),
    // cliff_durtime: CLValueBuilder.u64(0),
    // cliff_amount: CLValueBuilder.u256(20 * Math.pow(10, 8)),
    // unit_time: CLValueBuilder.u64(100),
    // recipient: CLValueBuilder.string("account-hash-baaa4a7bf8885accb42ce938b61b9f6e789a79748c61d37799e09a9b9019b8a7"),
    "scontract-hash": CLValueBuilder.string("contract-package-wasm7a86a5db039707adb8e081d59c1a299f5c17059304a22a4557c182966ef72ffb"),
  });

  const deploy = contract.callEntrypoint("init", args, keys.publicKey, "casper-test", "6000000000", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
}

async function approve() {
  contract.setContractHash("hash-ad2832dbb0d7bfdd8acc3d201aaf0a81d3897aa2664cc8b7094f2858452c9716");

  const args = RuntimeArgs.fromMap({
    spender: CasperHelpers.stringToKey("hash-43d889537476f67e6d3b01d4272667e989fc45e903d35538265089882318867a"),
    amount: CLValueBuilder.u256(10000000 * Math.pow(10, 8)),
  });

  const deploy = contract.callEntrypoint("approve", args, keys.publicKey, "casper-test", "6000000000", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
}

async function transfer() {
  contract.setContractHash("hash-ad2832dbb0d7bfdd8acc3d201aaf0a81d3897aa2664cc8b7094f2858452c9716");

  const args = RuntimeArgs.fromMap({
    recipient: CasperHelpers.stringToKey("hash-110eb141b839d6914b7f3a10cfafdc28b52a8c6bcdf893c0c085bc797b3025d1"),
    amount: CLValueBuilder.u256(5000000000),
  });

  const deploy = contract.callEntrypoint("transfer", args, keys.publicKey, "casper-test", "6000000000", [keys]);

  try {
    return await client.putDeploy(deploy);
  } catch (error) {
    return error;
  }
}

async function transfer_from() {
  contract.setContractHash("hash-ad2832dbb0d7bfdd8acc3d201aaf0a81d3897aa2664cc8b7094f2858452c9716");

  const recipient = CLPublicKey.fromHex("0203383ef36b477ebc85d19f9500911176c6c6da6c3591d15fe4a44ebf1b06bf8d24");

  const args = RuntimeArgs.fromMap({
    owner: CLValueBuilder.key(recipient),
    recipient: CasperHelpers.stringToKey("hash-baaa4a7bf8885accb42ce938b61b9f6e789a79748c61d37799e09a9b9019b8a7"),
    amount: CLValueBuilder.u256(2000000000),
  });

  const deploy = contract.callEntrypoint("transfer_from", args, keys.publicKey, "casper-test", "6000000000", [keys]);

  try {
    return await client.putDeploy(deploy);
  } catch (error) {
    return error;
  }
}

// approve();

// install();

lock();

// init();

// transfer_from();
