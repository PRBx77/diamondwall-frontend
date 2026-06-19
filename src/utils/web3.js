import { ethers } from "ethers";
import { CONTRACTS, NETWORK } from "./contracts";
import { TOKEN_ABI, PRESALE_ABI, TREASURY_V4_ABI, STAKING_ABI, AIRDROP_ABI, LIQUIDITY_ABI } from "./abis";

export async function connectWallet() {
  if (!window.ethereum) throw new Error("MetaMask no detectado");

  // Solicitar conexión
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

  // Verificar/cambiar red
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: NETWORK.chainIdHex }]
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: NETWORK.chainIdHex,
          chainName: NETWORK.name,
          rpcUrls: [NETWORK.rpc],
          nativeCurrency: NETWORK.currency
        }]
      });
    }
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return { provider, signer, account: accounts[0] };
}

export function getProvider() {
  return new ethers.JsonRpcProvider(NETWORK.rpc);
}

export function getContracts(signerOrProvider) {
  return {
    token: new ethers.Contract(CONTRACTS.TOKEN, TOKEN_ABI, signerOrProvider),
    presale: new ethers.Contract(CONTRACTS.PRESALE, PRESALE_ABI, signerOrProvider),
    treasury: new ethers.Contract(CONTRACTS.TREASURY, TREASURY_V4_ABI, signerOrProvider),
    liquidity: new ethers.Contract(CONTRACTS.LIQUIDITY, LIQUIDITY_ABI, signerOrProvider),
    staking: new ethers.Contract(CONTRACTS.STAKING, STAKING_ABI, signerOrProvider),
    airdrop: new ethers.Contract(CONTRACTS.AIRDROP, AIRDROP_ABI, signerOrProvider)
  };
}

export function formatTokens(value, decimals = 18) {
  return parseFloat(ethers.formatUnits(value, decimals)).toLocaleString("en-US", {
    maximumFractionDigits: 2
  });
}

export function parseTokens(value, decimals = 18) {
  return ethers.parseUnits(value.toString(), decimals);
}

export function formatETH(value) {
  return parseFloat(ethers.formatEther(value)).toFixed(6);
}
