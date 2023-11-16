const fs = require("fs");
const { RuntimeArgs, CLValueBuilder, Contracts, CasperClient, Keys, CLPublicKey, CLURef, Signer, CasperServiceByJsonRPC, CLAccountHash } = require("casper-js-sdk");
const { BN } = require("bn.js");
const client = new CasperClient("https://rpc.testnet.casperlabs.io/rpc");

const wasm = new Uint8Array(fs.readFileSync("storage.wasm"));

const keys = Keys.Secp256K1.loadKeyPairFromPrivateFile("test.pem");

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
    name: CLValueBuilder.string("lootbox_storage_testnet"),
  });

  const deploy = contract.install(wasm, args, "100000000000", keys.publicKey, "casper-test", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
}

// install();

const store = async () => {
  contract.setContractHash("hash-0302ae38b55a40bee18e32b7a100fd37eb2cc50b527dcfd1efdb7a18a28ccd3d");

  const args = RuntimeArgs.fromMap({
    data: CLValueBuilder.string("aabbcc"),
  });

  const deploy = contract.callEntrypoint("insert", args, keys.publicKey, "casper-test", "6000000000", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

// ab914b9df9d509c01ad9830e3b7bbb7a7927021fb9720afe8d7d59f851c4fe65

// store();

install();
