const fs = require("fs");
const {
  RuntimeArgs,
  CLValueBuilder,
  Contracts,
  CasperClient,
  Keys,
  CLPublicKey,
  CLKeyParameters,
  Signer,
  CasperServiceByJsonRPC,
  CLTypeBuilder,
} = require("casper-js-sdk");
const { error, log } = require("console");

const collectionName = "Collection-Material-5";
const collectionSymbol = "CM-5";

const client = new CasperClient("https://rpc.testnet.casperlabs.io/rpc");
const contract = new Contracts.Contract(client);

const keys = Keys.Ed25519.loadKeyPairFromPrivateFile("./keys/secret_key.pem");

const wasm = new Uint8Array(fs.readFileSync("contract.wasm"));

async function install() {
  const meta = {
    properties: {
      color: { name: "color", description: "", required: true },
    },
  };
  const args = RuntimeArgs.fromMap({
    collection_name: CLValueBuilder.string(collectionName),
    collection_symbol: CLValueBuilder.string(collectionSymbol),
    total_token_supply: CLValueBuilder.u64(8),
    ownership_mode: CLValueBuilder.u8(0),
    nft_kind: CLValueBuilder.u8(1),
    nft_metadata_kind: CLValueBuilder.u8(0),
    identifier_mode: CLValueBuilder.u8(0),
    metadata_mutability: CLValueBuilder.u8(0),
    json_schema: CLValueBuilder.string(JSON.stringify(meta)),
    minting_mode: CLValueBuilder.u8(1),
  });

  const deploy = contract.install(
    wasm,
    args,
    "250000000000",
    keys.publicKey,
    "casper-test",
    [keys]
  );
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
  contract.setContractHash(
    "hash-e080ed53d6536d5b13ab9eab9b81d50bf8425dbd82813e37490f53d9c43e0735"
  );

  const myKey = CLPublicKey.fromHex(
    "0129d4c70a9b7c07d9c69c08bdc632f19b6e736f3f5184e00c578259489376ed15"
  );

  const inputArgs = {
    owner: myKey,
    meta: {
      color: "Blue",
    },
  };

  const args = RuntimeArgs.fromMap({
    token_owner: CLValueBuilder.key(inputArgs.owner),
    token_meta_data: CLValueBuilder.string(JSON.stringify(inputArgs.meta)),
  });

  const deploy = contract.callEntrypoint(
    "mint",
    args,
    keys.publicKey,
    "casper-test",
    "2000000000",
    [keys]
  );
  //   console.log(deploy);
  try {
    return await client.putDeploy(deploy);
  } catch (error) {
    return error;
  }
};

mint()
  .then((deployHash) =>
    console.log("https://testnet.cspr.live/deploy/" + deployHash)
  )
  .catch((error) => console.error("error", error));
