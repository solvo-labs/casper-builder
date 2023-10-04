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
  CasperServiceByJsonRPC,
  CLAccountHash,
  CLByteArray,
  decodeBase16,
  AccessRights,
} = require("casper-js-sdk");
const { BN } = require("bn.js");
const client = new CasperClient("https://rpc.testnet.casperlabs.io/rpc");

const vestingWasm = new Uint8Array(fs.readFileSync("contract.wasm"));
const depositWasm = new Uint8Array(fs.readFileSync("deposit.wasm"));

const keys = Keys.Ed25519.loadKeyPairFromPrivateFile("test.pem");

const token = "6eae5730c2d15254fc9c2de5cac06dd7ab68357ce054163dbff8df71e3b4ce50";

const contract = new Contracts.Contract(client);
contract.setContractHash("hash-a1407196cc7f5df86184706438b7ee6c392154e890eb1e974ef7b310dd44d94c");

async function install() {
  const args = RuntimeArgs.fromMap({
    admin: new CLAccountHash(Buffer.from("45d00e5cb25fb65b9836806fe2a6e5633920b63a98cfbd8417ab7f887ae0b606", "hex")),
    recipient: new CLAccountHash(Buffer.from("74250dfec3c4465a196c371a8040de3e9bfddbd8bc16278919cb8008ffa1bf8d", "hex")),
    cliff_amount: CLValueBuilder.u256(0),
    cliff_timestamp: CLValueBuilder.u256(Date.now() + 100000000),
    drip_duration: CLValueBuilder.u256(Date.now() + 1000),
    drip_amount: CLValueBuilder.u256(10 * Math.pow(10, 8)),
    total_amount: CLValueBuilder.u256(100 * Math.pow(10, 8)),
    admin_release_duration: CLValueBuilder.u256(0),
    // token_contract_hash: new CLAccountHash(Buffer.from(token, "hex")),
    token_contract_hash: CLValueBuilder.string(token),
  });

  const deploy = contract.install(vestingWasm, args, "110000000000", keys.publicKey, "casper-test", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
}

async function deposit() {
  try {
    const args = RuntimeArgs.fromMap({});

    const deploy = await contract.callEntrypoint("deposit", args, keys.publicKey, "casper-test", "6000000000", [keys]);

    const tx = await client.putDeploy(deploy);
    console.log(tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
}

const admin_release = async () => {
  const args = RuntimeArgs.fromMap({});

  const deploy = contract.callEntrypoint("admin_release", args, keys.publicKey, "casper-test", "6000000000", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

const withdraw = async () => {
  const args = RuntimeArgs.fromMap({
    amount: CLValueBuilder.u512("110000000000"),
  });

  const deploy = contract.callEntrypoint("withdraw", {}, keys.publicKey, "casper-test", "6000000000", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

// const fetchVesting = async () => {
//   const contract = new Contracts.Contract(client);
//   contract.setContractHash("hash-ffa369c45bc581fdb031e2580ea8a1a25ca63e66dcae8016a89de7fcb74ac6aa");

//   const admin_account = await contract.queryContractData(["admin_account"]);
//   const recipient = await contract.queryContractData(["recipient_account"]);
//   // const drip_amount = await contract.queryContractData(["vesting_main_purse"]);

//   const result = await contract.queryContractDictionary("vesting_main_purse", "0");
//   console.log(result);
// };

// fetchVesting();

// getDepositPurse();
deposit();

// install();

// withdraw();
