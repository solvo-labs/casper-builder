const fs = require("fs");
const { RuntimeArgs, CLValueBuilder, Contracts, CasperClient, Keys, CLPublicKey } = require("casper-js-sdk");

const client = new CasperClient("https://rpc.testnet.casperlabs.io/rpc");
const contract = new Contracts.Contract(client);
const keys = Keys.Ed25519.loadKeyPairFromPrivateFile("test.pem");

const wasm = new Uint8Array(fs.readFileSync("cep18_contract.wasm"));

async function install() {
  const args = RuntimeArgs.fromMap({
    name: CLValueBuilder.string("Afc"),
    symbol: CLValueBuilder.string("Afc"),
    decimals: CLValueBuilder.i32(8),
    totalSupply: CLValueBuilder.i64(1000),
  });

  const deploy = contract.install(wasm, args, "60000000000", keys.publicKey, "casper-test", [keys]);

  try {
    return await client.putDeploy(deploy);
  } catch (error) {
    return error;
  }
}

install()
  .then((deployHash) => console.log("hash", deployHash))
  .catch((error) => console.error("error", error));
