const ethers = require("ethers");
const CONTRACT_ABI = require("./abi/TransparentUpgradeableProxy.json");
const ERC20_ABI = require("./abi/ERC20.json");
require('dotenv').config();

const BRIDGE_ADDRESS = process.env.BRIDGE_ADDRESS;
const FX_TOKEN_ADDRESS = process.env.FX_TOKEN_ADDRESS;
const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL

const provider = new ethers.getDefaultProvider(ETHEREUM_RPC_URL);
const bridgeContract = new ethers.Contract(BRIDGE_ADDRESS, CONTRACT_ABI, provider);

const queryInfo = async() => {
  let tokenLists = await bridgeContract.getBridgeTokenList();
  let result = [];
  for (let item of tokenLists) {
    let currentTokenData = {
      "address": item[0],
      "name": item[1],
      "symbol": item[2],
      "decimal": Number(item[3]),
    };
    const tokenContract = new ethers.Contract(currentTokenData.address, ERC20_ABI, provider);
    currentTokenData.balance = Number(await tokenContract.balanceOf(BRIDGE_ADDRESS)) / 10 ** currentTokenData.decimal;
    result.push(currentTokenData);
  }
  return result;
};

const main = async () => {
  const tokenData = await queryInfo();

  // get total supply of fx bridge token
  const fxTokenContract = new ethers.Contract(FX_TOKEN_ADDRESS, ERC20_ABI, provider);
  const totalSupply = Number(await fxTokenContract.totalSupply()) / 10 ** Number(await fxTokenContract.decimals());

  const data = {
    tokenData,
    totalSupply,
  }
};

main();