const fs = require("fs");
const { RuntimeArgs, CLValueBuilder, Contracts, CasperClient, Keys, CLPublicKey, CLURef, Signer, CasperServiceByJsonRPC, CLAccountHash } = require("casper-js-sdk");

const client = new CasperClient("https://rpc.testnet.casperlabs.io/rpc");
const contract = new Contracts.Contract(client);

const vestingWasm = new Uint8Array(fs.readFileSync("vesting.wasm"));
const depositWasm = new Uint8Array(fs.readFileSync("deposit.wasm"));

const keys = Keys.Ed25519.loadKeyPairFromPrivateFile("test.pem");

const adminPublickey = Buffer.from(keys.publicKey.data).toString("hex");

async function install() {
  const args = RuntimeArgs.fromMap({
    admin: new CLAccountHash(Buffer.from("45d00e5cb25fb65b9836806fe2a6e5633920b63a98cfbd8417ab7f887ae0b606", "hex")),
    recipient: new CLAccountHash(Buffer.from("74250dfec3c4465a196c371a8040de3e9bfddbd8bc16278919cb8008ffa1bf8d", "hex")),
    cliff_amount: CLValueBuilder.u512(0),
    cliff_timestamp: CLValueBuilder.u512(Date.now() + 100000000),
    drip_duration: CLValueBuilder.u512(Date.now() + 1000),
    drip_amount: CLValueBuilder.u512(110000000000),
    total_amount: CLValueBuilder.u512(110000000000),
    admin_release_duration: CLValueBuilder.u512(0),
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
  const args = RuntimeArgs.fromMap({
    deposit_contract_hash: new CLAccountHash(Buffer.from("9590b2a8b1c150cc5068e106c99f22c59a39d49b71a14798560693acc9e765d2", "hex")),
    amount: CLValueBuilder.u512(110000000000),
    deposit_purse: new CLURef(Buffer.from("382307d22ae4a38278b221af8b00ab3829df11660884a6aebbc5a604f64a9296-007", "hex"), 7),
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

const getDepositPurse = async () => {
  const contract = new Contracts.Contract(client);
  contract.setContractHash("hash-9590b2a8b1c150cc5068e106c99f22c59a39d49b71a14798560693acc9e765d2");

  const args = RuntimeArgs.fromMap({});

  const deploy = contract.callEntrypoint("get_deposit_purse", args, keys.publicKey, "casper-test", "6000000000", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

const withdraw = async () => {
  const contract = new Contracts.Contract(client);
  contract.setContractHash("hash-9590b2a8b1c150cc5068e106c99f22c59a39d49b71a14798560693acc9e765d2");

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

// install();

withdraw();
