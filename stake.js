const fs = require("fs");
const {
  RuntimeArgs,
  CLValueBuilder,
  Contracts,
  CasperClient,
  Keys,
  CLPublicKey,
  CLURef,
  Signer,
  CasperServiceByJsonRPC,

  CLAccountHash,
  CLByteArray,
} = require("casper-js-sdk");
const { BN } = require("bn.js");
const client = new CasperClient("https://rpc.testnet.casperlabs.io/rpc");

const delegateWasm = new Uint8Array(fs.readFileSync("delegate.wasm"));

const keys = Keys.Ed25519.loadKeyPairFromPrivateFile("test.pem");

const contract = new Contracts.Contract(client);

async function install() {
  const args = RuntimeArgs.fromMap({});

  const deploy = contract.install(delegateWasm, args, "100000000000", keys.publicKey, "casper-test", [keys]);

  try {
    const tx = await client.putDeploy(deploy);

    console.log("tx", tx);
  } catch (error) {
    console.log("error", error);
    return error;
  }
}

const fetchData = async () => {
  const x = await client.nodeClient.getValidatorsInfo();
  client.nodeClient.deploy;
  console.log(x);

  const data = x.auction_state;

  const eraValidators = data.era_validators;

  const bids = data.bids;

  const filteredBids = bids.filter((bd) => !bd.bid.inactive && bd.bid.delegators.length < 200);

  console.log(filteredBids);
};

fetchData();
