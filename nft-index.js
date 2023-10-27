const fs = require("fs");
const {
  RuntimeArgs,
  CLValueBuilder,
  Contracts,
  CasperClient,
  Keys,
  CLPublicKey,
  CLKey,
  CLByteArray,
  CLKeyParameters,
  Signer,
  CasperServiceByJsonRPC,
  CLTypeBuilder,
} = require("casper-js-sdk");
const { error, log } = require("console");

const collectionName = "test-12345";
const collectionSymbol = "test";

const client = new CasperClient("https://rpc.testnet.casperlabs.io/rpc");
const contract = new Contracts.Contract(client);

const keys = Keys.Secp256K1.loadKeyPairFromPrivateFile("test.pem");

const wasm = new Uint8Array(fs.readFileSync("contract.wasm"));

// const MOCKED_RECIPIENT_PUBKEY = CLPublicKey.fromHex("0129d4c70a9b7c07d9c69c08bdc632f19b6e736f3f5184e00c578259489376ed15");

async function install() {
  const args = RuntimeArgs.fromMap({
    collection_name: CLValueBuilder.string(collectionName),
    collection_symbol: CLValueBuilder.string(collectionSymbol),
    total_token_supply: CLValueBuilder.u64(1000),
    ownership_mode: CLValueBuilder.u8(2),
    nft_kind: CLValueBuilder.u8(1),
    nft_metadata_kind: CLValueBuilder.u8(2),
    // whitelist_mode: CLValueBuilder.u8(0),
    identifier_mode: CLValueBuilder.u8(0),
    metadata_mutability: CLValueBuilder.u8(0),
    json_schema: CLValueBuilder.string(JSON.stringify({})),
    events_mode: CLValueBuilder.u8(2),
    // minting_mode: CLValueBuilder.u8(0),
    // burn_mode: CLValueBuilder.u8(0),
    // holder_mode: CLValueBuilder.u8(2),
  });

  const deploy = contract.install(wasm, args, "300000000000", keys.publicKey, "casper-test", [keys]);
  //   console.log(deploy);
  try {
    return await client.putDeploy(deploy);
  } catch (error) {
    return error;
  }
}

// install()
//   .then((deployHash) => console.log("https://testnet.cspr.live/deploy/" + deployHash))
//   .catch((error) => console.error(error));

const mint = async () => {
  contract.setContractHash("hash-006ed2be746c2848614b74faece0ea791568ade2fb219708da2c0c43f5cfa71c");

  const myKey = keys.publicKey;

  const inputArgs = {
    owner: myKey,
    meta: {
      name: "deeee",
      description: "deee",
      asset: "https://maritime.sealstorage.io/ipfs/bafybeiciq67vw7rkmaaivdackzude7unqq54bpjo3fdnowxihf7v3yxvgi",
    },
  };

  const args = RuntimeArgs.fromMap({
    token_owner: CLValueBuilder.key(inputArgs.owner),
    token_meta_data: CLValueBuilder.string(JSON.stringify(inputArgs.meta)),
  });

  const deploy = contract.callEntrypoint("mint", args, keys.publicKey, "casper-test", "5000000000", [keys]);
  console.log(deploy);
  try {
    return await client.putDeploy(deploy);
  } catch (error) {
    return error;
  }
};

const mint2 = async () => {
  contract.setContractHash("hash-98a99e2f424a09fd688a8f430c779341ca6664232c50199d89548644eb27baea");

  const myKey = keys.publicKey;

  const inputArgs = {
    owner: myKey,
    meta: {
      name: "Kaaaa2",
      description: "Hhahaha",
    },
  };

  const args = RuntimeArgs.fromMap({
    token_owner: CLValueBuilder.key(inputArgs.owner),
    token_meta_data: CLValueBuilder.string(JSON.stringify(inputArgs.meta)),
  });

  const deploy = contract.callEntrypoint("mint", args, keys.publicKey, "casper-test", "5000000000", [keys]);

  try {
    return await client.putDeploy(deploy);
  } catch (error) {
    return error;
  }
};

// const approve = async () => {
//   contract.setContractHash("hash-53401f8ea1e3956c871ca9f6eaa4971300c01b2d1d74240855a8347e53c282e3");

//   const args = RuntimeArgs.fromMap({
//     operator: CLValueBuilder.key(keys.publicKey),
//     token_id: CLValueBuilder.u64(0),
//   });

//   const deploy = contract.callEntrypoint("approve", args, keys.publicKey, "casper-test", 1000000000, [keys]);

//   client.putDeploy(deploy).then((tx) => {
//     console.log("data", tx);
//   });

//   try {
//     return await client.putDeploy(deploy);
//   } catch (error) {
//     return error;
//   }
// };

const transfer = async () => {
  contract.setContractHash("hash-98a99e2f424a09fd688a8f430c779341ca6664232c50199d89548644eb27baea");

  const myKey = keys.publicKey;

  const args = RuntimeArgs.fromMap({
    target_key: CLValueBuilder.key(MOCKED_RECIPIENT_PUBKEY),
    source_key: CLValueBuilder.key(myKey),
    token_id: CLValueBuilder.u64(0),
  });

  const deploy = contract.callEntrypoint("transfer", args, keys.publicKey, "casper-test", "11000000000", [keys]);
  console.log(deploy);
  try {
    return await client.putDeploy(deploy);
  } catch (error) {
    return error;
  }
};

const approve = async () => {
  contract.setContractHash("hash-b1acd833758036848ff21448621e9a545af5e96c9a6bf27a4103d59bb925867f");

  const myKey = keys.publicKey;
  console.log("keyyy", myKey.toAccountHashStr());

  const args = RuntimeArgs.fromMap({
    operator: new CLKey(new CLByteArray(Uint8Array.from(Buffer.from("2c2778415e856d528e2717eba8578b907de8b366b7a9860a3c63063e4a9ef2a7", "hex")))),
    token_id: CLValueBuilder.u64(0),
  });

  const deploy = contract.callEntrypoint("approve", args, keys.publicKey, "casper-test", "11000000000", [keys]);
  console.log(deploy);
  try {
    return await client.putDeploy(deploy);
  } catch (error) {
    return error;
  }
};

// mint()
//   .then((deployHash) => console.log("https://testnet.cspr.live/deploy/" + deployHash))
//   .catch((error) => console.error("error", error));
const x = async () => {
  const data = await client.balanceOfByPublicKey(CLPublicKey.fromHex("02030b4e9ee2095c1e5d65c50690dc2b550cc7241ba9261af25aa0727a9c9af8d783"));
  console.log(data);
};

x();
