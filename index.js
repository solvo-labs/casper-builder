const fs = require("fs");
const { RuntimeArgs, CLValueBuilder, Contracts, CasperClient, Keys, CLPublicKey } = require("casper-js-sdk");

const client = new CasperClient("https://rpc.testnet.casperlabs.io/rpc");
const contract = new Contracts.Contract(client);

const keys = Keys.Ed25519.loadKeyPairFromPrivateFile("test.pem");

const wasm = new Uint8Array(fs.readFileSync("cep18.wasm"));

async function install() {
  const args = RuntimeArgs.fromMap({
    name: CLValueBuilder.string("Pikpikpik"),
    symbol: CLValueBuilder.string("Pik"),
    decimals: CLValueBuilder.u8(8),
    total_supply: CLValueBuilder.u256(100000000000),
  });

  const deploy = contract.install(wasm, args, "110000000000", keys.publicKey, "casper-test", [keys]);

  try {
    return await client.putDeploy(deploy);
  } catch (error) {
    return error;
  }
}

//ae41cac587c858cded57e69814812bcf76972ca5c89679014cf9a36821796654

const transfer = async () => {
  contract.setContractHash("hash-e42516e4644aa7b087fc4ec997d38a2839a910eb281e3b58626bf45476860186");

  const pubkey = "02023e4cd902b76b2a8c8becd120440d122fb406a3918e681e2f1c6282fdd2af915a";

  const receipent = CLPublicKey.fromHex(pubkey);

  const args = RuntimeArgs.fromMap({
    recipient: CLValueBuilder.key(receipent),
    amount: CLValueBuilder.u256(500),
  });

  const deploy = contract.callEntrypoint("transfer", args, keys.publicKey, "casper-test", "6000000000", [keys]);

  try {
    return await client.putDeploy(deploy);
  } catch (error) {
    return error;
  }
};

// const approve = async () => {
//   contract.setContractHash("hash-8b7259949e6246020830cd7927c15c30aeb029e6ffe350f179590b4ac5308f3f");

//   const pubkey = "02023e4cd902b76b2a8c8becd120440d122fb406a3918e681e2f1c6282fdd2af915a";

//   const receipent = CLPublicKey.fromHex(pubkey);

//   const args = RuntimeArgs.fromMap({
//     spender: CLValueBuilder.key(receipent),
//     amount: CLValueBuilder.u256(1000000),
//   });

//   const deploy = contract.callEntrypoint("approve", args, keys.publicKey, "casper-test", 5_000_000_000, [keys]);

//   client.putDeploy(deploy).then((tx) => {
//     console.log("data", tx);
//   });

//   try {
//     return await client.putDeploy(deploy);
//   } catch (error) {
//     return error;
//   }
// };

function queryMessage() {
  contract.setContractHash("hash-e42516e4644aa7b087fc4ec997d38a2839a910eb281e3b58626bf45476860186");

  return contract.queryContractData(["symbol"]);
}

const mint = async () => {
  contract.setContractHash("hash-e42516e4644aa7b087fc4ec997d38a2839a910eb281e3b58626bf45476860186");

  const pubkey = "02023e4cd902b76b2a8c8becd120440d122fb406a3918e681e2f1c6282fdd2af915a";

  const receipent = CLPublicKey.fromHex(pubkey);

  const args = RuntimeArgs.fromMap({
    owner: CLValueBuilder.key(receipent),
    amount: CLValueBuilder.u256(1000),
  });

  const deploy = contract.callEntrypoint("mint", args, keys.publicKey, "casper-test", "6000000000", [keys]);

  try {
    return await client.putDeploy(deploy);
  } catch (error) {
    return error;
  }
};

// mint()
//   .then((deployHash) => console.log("hash", deployHash))
//   .catch((error) => console.error("error", error));

// install()
//   .then((deployHash) => console.log("hash", deployHash))
//   .catch((error) => console.error("error", error));

// approve()
//   .then((deployHash) => console.log("hash", deployHash))
//   .catch((error) => console.error("error", error));

// queryMessage()
//   .then((data) => {
//     console.log("data", data);
//   })
//   .catch((err) => {
//     console.log("err", err);
//   });

transfer()
  .then((deployHash) => console.log("hash", deployHash))
  .catch((error) => console.error("error", error));
