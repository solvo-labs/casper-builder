const fs = require("fs");
const { RuntimeArgs, CLValueBuilder, Contracts, CasperClient, Keys, CLPublicKey, Signer, CasperServiceByJsonRPC, CLAccountHash } = require("casper-js-sdk");

const client = new CasperClient("https://rpc.testnet.casperlabs.io/rpc");
const contract = new Contracts.Contract(client);

const keys = Keys.Secp256K1.loadKeyPairFromPrivateFile("test.pem");

const wasm = new Uint8Array(fs.readFileSync("lootbox.wasm"));

async function install() {
  const args = RuntimeArgs.fromMap({
    name: CLValueBuilder.string("loot1"),
    description: CLValueBuilder.string("lotlootloot"),
    asset: CLValueBuilder.string("hhhhh"),
  });

  const deploy = contract.install(wasm, args, "50000000000", keys.publicKey, "casper-test", [keys]);
  console.log(deploy);
  try {
    const x = await client.putDeploy(deploy);

    console.log(x);

    return x;
  } catch (error) {
    return error;
  }
}

install();
