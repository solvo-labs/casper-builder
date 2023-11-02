const fs = require("fs");
const { RuntimeArgs, CLValueBuilder, Contracts, CLKey, CasperClient, CLByteArray, Keys, CLPublicKey, Signer, CasperServiceByJsonRPC, CLAccountHash } = require("casper-js-sdk");
const axios = require("axios");
const client = new CasperClient("https://rpc.testnet.casperlabs.io/rpc");
const contract = new Contracts.Contract(client);
const WizData = require("@script-wiz/wiz-data");

const keys = Keys.Secp256K1.loadKeyPairFromPrivateFile("test.pem");

const wasm = new Uint8Array(fs.readFileSync("lootbox.wasm"));

const collectionHash = "hash-a4421d0d03d0c23ce485303bf6966360313b0339c0e374a77494d6506e8aa4ae";
const contractHash = "c7379c27496eae16f0ba7c6346b39a7622fc57b6d3b032a795389cc97bd64cb8";
const tokenId = 10;

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
    name: CLValueBuilder.string("OG-A"),
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
    item_name: CLValueBuilder.string("Item-2"),
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

const claim = async () => {
  // collection hash
  contract.setContractHash("hash-" + contractHash);

  // operator = Raffle Contract hash
  const args = RuntimeArgs.fromMap({
    item_index: CLValueBuilder.u64(7),
  });

  const deploy = contract.callEntrypoint("claim", args, keys.publicKey, "casper-test", "12000000000", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

const hex2a = (hexx) => {
  const hex = hexx.toString(); //force conversion
  let str = "";
  for (var i = 0; i < hex.length; i += 2) str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
};

const fetchData = async () => {
  const instance = new CasperServiceByJsonRPC("https://rpc.testnet.casperlabs.io/rpc");
  const stateRootHash = await instance.getStateRootHash();

  const dt = await client.nodeClient.getBlockState(stateRootHash, `hash-${contractHash}`, []);
  const urefMap = dt.Contract.namedKeys.find((nm) => nm.name === "items");
  const uref = urefMap.key;
  const dictKey = "1";

  const body = {
    jsonrpc: "2.0",
    id: "1",
    method: "state_get_dictionary_item",
    params: {
      state_root_hash: stateRootHash,
      dictionary_identifier: {
        URef: {
          seed_uref: uref,
          dictionary_item_key: dictKey,
        },
      },
    },
  };

  const res = await fetch("https://node-clarity-testnet.make.services/rpc", {
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
    method: "POST",
  });

  const data = await res.json();
  const nonparsedData = data.result.stored_value.CLValue.bytes;

  const id = nonparsedData.slice(0, 16);

  const rarity = nonparsedData.slice(16, 32);
  const tokenId = nonparsedData.slice(32, 48);
  const name = nonparsedData.slice(48);

  const idLe = WizData.hexLE(id);

  const idValue = parseInt(idLe, 16);

  const rarityLe = WizData.hexLE(rarity);

  const rarityValue = parseInt(rarityLe, 16);

  const tokenIdLe = WizData.hexLE(tokenId);

  const tokenIdValue = parseInt(tokenId, 16);

  const nameText = hex2a(name);

  // const data = (await contract.queryContractDictionary("items", "2")).isCLValue;
  // console.log(x);
};

// install();

// approve();

// addItem();

// purchase();

// claim();

// fetchData();
