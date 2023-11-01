const fs = require("fs");
const { RuntimeArgs, CLValueBuilder, Contracts, CLKey, CasperClient, CLByteArray, Keys, CLPublicKey, Signer, CasperServiceByJsonRPC, CLAccountHash } = require("casper-js-sdk");

const client = new CasperClient("https://rpc.testnet.casperlabs.io/rpc");
const contract = new Contracts.Contract(client);

const keys = Keys.Secp256K1.loadKeyPairFromPrivateFile("test.pem");

const wasm = new Uint8Array(fs.readFileSync("lootbox.wasm"));

const collectionHash = "hash-a4421d0d03d0c23ce485303bf6966360313b0339c0e374a77494d6506e8aa4ae";
const contractHash = "423aca1c61a4cb740a76a38e41d861ca3960ce0dada24fbc43c7e7f25db6e2e2";
const tokenId = 2;

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

// let name: String = runtime::get_named_arg(NAME);
// let description: String = runtime::get_named_arg(DESCRIPTION);
// let asset: String = runtime::get_named_arg(ASSET);
// let nft_collection: Key = runtime::get_named_arg(NFT_COLLECTION);
// let lootbox_price: U512 = runtime::get_named_arg(LOOTBOX_PRICE);
// let items_per_lootbox: U256 = runtime::get_named_arg(ITEMS_PER_LOOTBOX);
// let max_lootboxes: U256 = runtime::get_named_arg(MAX_LOOTBOXES);
// let lootbox_count: U256 = runtime::get_named_arg(LOOTBOX_COUNT);
// let max_items: U256 = runtime::get_named_arg(MAX_ITEMS);

async function install() {
  const args = RuntimeArgs.fromMap({
    name: CLValueBuilder.string("AABBCC"),
    description: CLValueBuilder.string("lotlootloot"),
    asset: CLValueBuilder.string("asset"),
    nft_collection: CasperHelpers.stringToKey(collectionHash),
    lootbox_price: CLValueBuilder.u512(5 * Math.pow(10, 9)),
    items_per_lootbox: CLValueBuilder.u64(3),
    max_lootboxes: CLValueBuilder.u64(2),
    max_items: CLValueBuilder.u64(3),
  });

  const deploy = contract.install(wasm, args, "110000000000", keys.publicKey, "casper-test", [keys]);
  console.log(deploy);
  try {
    const x = await client.putDeploy(deploy);

    console.log(x);

    return x;
  } catch (error) {
    return error;
  }
}

const approve = async () => {
  // collection hash
  contract.setContractHash(collectionHash);

  // operator = Raffle Contract hash
  const args = RuntimeArgs.fromMap({
    operator: new CLKey(new CLByteArray(Uint8Array.from(Buffer.from(contractHash, "hex")))),
    token_id: CLValueBuilder.u64(tokenId),
  });

  const deploy = contract.callEntrypoint("approve", args, keys.publicKey, "casper-test", "4000000000", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

const addItem = async () => {
  // collection hash
  contract.setContractHash("hash-" + contractHash);

  // operator = Raffle Contract hash
  const args = RuntimeArgs.fromMap({
    item_name: CLValueBuilder.string("Item-1"),
    token_id: CLValueBuilder.u64(tokenId),
  });

  const deploy = contract.callEntrypoint("add_item", args, keys.publicKey, "casper-test", "12000000000", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

const purchase = async () => {
  // collection hash
  contract.setContractHash("hash-" + contractHash);

  // operator = Raffle Contract hash
  const args = RuntimeArgs.fromMap({});

  const deploy = contract.callEntrypoint("purchase", args, keys.publicKey, "casper-test", "12000000000", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

// install();

// approve();

// addItem();

purchase();
