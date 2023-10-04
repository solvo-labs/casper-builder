const fs = require("fs");
const {
  RuntimeArgs,
  CLValueBuilder,
  CLPublicKeyTag,
  Contracts,
  CasperClient,
  Keys,
  CLPublicKey,
  CLURef,
  Signer,
  CasperServiceByJsonRPC,
  CLAccountHash,
  CLByteArray,
} = require("casper-js-sdk");
const { BN } = require("bn.js");
const client = new CasperClient("https://rpc.testnet.casperlabs.io/rpc");

const wasm = new Uint8Array(fs.readFileSync("marketplace_contract.wasm"));

const keys = Keys.Ed25519.loadKeyPairFromPrivateFile("test.pem");

const token = "82df69c6aeae758e76f2808f9e3a6df3f21124d555b1e8bd3a1ca75a9eab6215";

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
  const recipient1 = CLPublicKey.fromHex("01eb27dfe3cd9493c266a25f0ebd70f64fa99e26b12bd48645868286e394dff022");
  const recipient2 = CLPublicKey.fromHex("0202e49305d571d77b7de9293021099c41364174f76b33987d164b47b97f3c29a615");

  const args = RuntimeArgs.fromMap({
    contract_name: CLValueBuilder.string("aaxxx"),
    vesting_amount: CLValueBuilder.u256(150 * Math.pow(10, 8)),
    cep18_contract_hash: CasperHelpers.stringToKey(token),
    start_date: CLValueBuilder.u64(Date.now() + 180 * 1000),
    duration: CLValueBuilder.u64(3600 * 1000),
    period: CLValueBuilder.u64(60 * 1000),
    recipients: CLValueBuilder.list([CLValueBuilder.key(recipient1), CLValueBuilder.key(recipient2)]),
    allocations: CLValueBuilder.list([CLValueBuilder.u256(50 * Math.pow(10, 8)), CLValueBuilder.u256(50 * Math.pow(10, 8))]),
    cliff_timestamp: CLValueBuilder.u64(60 * 1000),
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

async function claim() {
  contract.setContractHash("hash-445ca4df920a89b5c5dde33bdef98fb76435de86f46a5dd5eddf60a692c419d5");

  const recipient = CLPublicKey.fromHex("01eb27dfe3cd9493c266a25f0ebd70f64fa99e26b12bd48645868286e394dff022");
  // const contractHash = "0d12ae63fde39006f90f5681908013044b8c161f2aac9271656acd17b29bf4d8";

  const args = RuntimeArgs.fromMap({
    cep18_contract_hash: CasperHelpers.stringToKey(token),
    // claim_amount: CLValueBuilder.u256(75 * Math.pow(10, 8)),
    // recipient: CLValueBuilder.key(recipient),
    index: CLValueBuilder.i32(0),
  });

  const deploy = contract.callEntrypoint("claim", args, keys.publicKey, "casper-test", "6000000000", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
}

async function approve() {
  contract.setContractHash("hash-" + token);

  const args = RuntimeArgs.fromMap({
    spender: CasperHelpers.stringToKey("bc74e1b5a0958f479cc0adcb881fc49e35dd96d9c4cabbd1c9e3c7f444b37eae"),
    amount: CLValueBuilder.u256(150 * Math.pow(10, 8)),
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
  contract.setContractHash("hash-" + token);

  const args = RuntimeArgs.fromMap({
    recipient: CasperHelpers.stringToKey("7b68d69b627126d8e0ac5e27ffbee7f76d8c15a8633736980a10c97a8b7bc466"),
    amount: CLValueBuilder.u256(100 * Math.pow(10, 8)),
  });

  const deploy = contract.callEntrypoint("transfer", args, keys.publicKey, "casper-test", "6000000000", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
}

async function transfer_from() {
  contract.setContractHash("hash-" + token);
  const recipient = CLPublicKey.fromHex("020323cbed17747739943aa61d59cdac8b61bb7d0383cb41297f90d718f44ec0c070");

  const args = RuntimeArgs.fromMap({
    // owner: CLValueBuilder.key(recipient),
    owner: keys.publicKey,
    recipient: CasperHelpers.stringToKey("7ec1626c7496d1f64180d818c4bb2ed5608d443de1780f5d84913f9b13162d1d"),
    amount: CLValueBuilder.publicKey(100 * Math.pow(10, 8)),
  });

  const deploy = contract.callEntrypoint("transfer_from", args, keys.publicKey, "casper-test", "6000000000", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
}

// deposit();
// transfer();

// install();

// approve();

// transfer_from();

claim();
