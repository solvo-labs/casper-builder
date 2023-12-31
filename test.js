const fs = require("fs");
const { RuntimeArgs, CLValueBuilder, Contracts, CasperClient, Keys, CLPublicKey, CLURef, Signer, CasperServiceByJsonRPC, CLAccountHash } = require("casper-js-sdk");
const { BN } = require("bn.js");
const client = new CasperClient("https://rpc.testnet.casperlabs.io/rpc");

const vestingWasm = new Uint8Array(fs.readFileSync("contract1.wasm"));

const keys = Keys.Ed25519.loadKeyPairFromPrivateFile("test.pem");

const contract = new Contracts.Contract(client);

async function install() {
  const args = RuntimeArgs.fromMap({
    // admin: new CLAccountHash(Buffer.from("45d00e5cb25fb65b9836806fe2a6e5633920b63a98cfbd8417ab7f887ae0b606", "hex")),
    // recipient: new CLAccountHash(Buffer.from("74250dfec3c4465a196c371a8040de3e9bfddbd8bc16278919cb8008ffa1bf8d", "hex")),
    // cliff_amount: CLValueBuilder.u512(0),
    // cliff_timestamp: CLValueBuilder.u512(Date.now() + 100000000),
    // drip_duration: CLValueBuilder.u512(Date.now() + 1000),
    // drip_amount: CLValueBuilder.u512(110000000000),
    // total_amount: CLValueBuilder.u512(110000000000),
    // admin_release_duration: CLValueBuilder.u512(0),
  });

  console.log(vestingWasm);

  const deploy = contract.install(vestingWasm, RuntimeArgs.fromMap({}), "100000000000", keys.publicKey, "casper-test", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
}

async function deposit() {
  contract.contractHash;
  const args = RuntimeArgs.fromMap({
    deposit_contract_hash: new CLAccountHash(Buffer.from("78dd5f61c96bc394a1cfa5f13a3dec59fe3cd9da58fa99c67d702124c9350a6f", "hex")),
    // token_contract_hash: new CLAccountHash(Buffer.from("7e4cfdd7bfae515e013209a8ff91f7bf35955e69195d41e6376058f098a18f4b", "hex")),
    // amount: CLValueBuilder.u256(11000000),
  });

  const deploy = contract.install(depositWasm, args, "110000000000", keys.publicKey, "casper-test", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
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

  const deploy = contract.callEntrypoint("withdraw", args, keys.publicKey, "casper-test", "6000000000", [keys]);

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

// deposit();

install();

// withdraw();
