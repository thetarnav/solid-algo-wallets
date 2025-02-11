import { Algodv2, waitForConfirmation } from 'algosdk'
import { createMemo, createRoot, createSignal } from 'solid-js'
import {
  AccountInfo,
  AssetData,
  ConfirmedTxn,
  NetworkConfig,
  NetworkConfigs,
  NetworkName,
} from './types'
import { makeAlgoAssetDataObj, makeAssetDataObj } from './utilities'

const MAINNET_ALGOD_TOKEN = import.meta.env.VITE_MAINNET_ALGOD_TOKEN
const MAINNET_ALGOD_SERVER = import.meta.env.VITE_MAINNET_ALGOD_SERVER
const MAINNET_ALGOD_PORT = import.meta.env.VITE_MAINNET_ALGOD_PORT
const MAINNET_WALLETCONNECT_CHAIN_ID = import.meta.env.VITE_MAINNET_WALLETCONNECT_CHAIN_ID
const MAINNET_PERA_CHAIN_ID = import.meta.env.VITE_MAINNET_PERA_CHAIN_ID
const MAINNET_BLOCK_EXPLORER = import.meta.env.VITE_MAINNET_BLOCK_EXPLORER
const MAINNET_NFD_SERVER = import.meta.env.VITE_MAINNET_NFD_SERVER

const TESTNET_ALGOD_TOKEN = import.meta.env.VITE_TESTNET_ALGOD_TOKEN
const TESTNET_ALGOD_SERVER = import.meta.env.VITE_TESTNET_ALGOD_SERVER
const TESTNET_ALGOD_PORT = import.meta.env.VITE_TESTNET_ALGOD_PORT
const TESTNET_WALLETCONNECT_CHAIN_ID = import.meta.env.VITE_TESTNET_WALLETCONNECT_CHAIN_ID
const TESTNET_PERA_CHAIN_ID = import.meta.env.VITE_TESTNET_PERA_CHAIN_ID
const TESTNET_BLOCK_EXPLORER = import.meta.env.TESTNET_BLOCK_EXPLORER
const TESTNET_NFD_SERVER = import.meta.env.TESTNET_NFD_SERVER

const BETANET_ALGOD_TOKEN = import.meta.env.VITE_BETANET_ALGOD_TOKEN
const BETANET_ALGOD_SERVER = import.meta.env.VITE_BETANET_ALGOD_SERVER
const BETANET_ALGOD_PORT = import.meta.env.VITE_BETANET_ALGOD_PORT
const BETANET_WALLETCONNECT_CHAIN_ID = import.meta.env.VITE_BETANET_WALLETCONNECT_CHAIN_ID
const BETANET_PERA_CHAIN_ID = import.meta.env.VITE_BETANET_PERA_CHAIN_ID
const BETANET_BLOCK_EXPLORER = import.meta.env.BETANET_BLOCK_EXPLORER
const BETANET_NFD_SERVER = import.meta.env.BETANET_NFD_SERVER

const LOCALNET_ALGOD_TOKEN = import.meta.env.VITE_LOCALNET_ALGOD_TOKEN
const LOCALNET_ALGOD_SERVER = import.meta.env.VITE_LOCALNET_ALGOD_SERVER
const LOCALNET_ALGOD_PORT = import.meta.env.VITE_LOCALNET_ALGOD_PORT
const LOCALNET_WALLETCONNECT_CHAIN_ID = import.meta.env.VITE_LOCALNET_WALLETCONNECT_CHAIN_ID
const LOCALNET_PERA_CHAIN_ID = import.meta.env.VITE_LOCALNET_PERA_CHAIN_ID
const LOCALNET_BLOCK_EXPLORER = import.meta.env.LOCALNET_BLOCK_EXPLORER
const LOCALNET_NFD_SERVER = import.meta.env.LOCALNET_NFD_SERVER

const MAINNET_CONFIG: NetworkConfig = {
  algodToken: MAINNET_ALGOD_TOKEN,
  algodServer: MAINNET_ALGOD_SERVER,
  algodPort: MAINNET_ALGOD_PORT,
  blockExplorer: MAINNET_BLOCK_EXPLORER,
  walletConnect2ChainID: MAINNET_WALLETCONNECT_CHAIN_ID,
  peraChainId: MAINNET_PERA_CHAIN_ID,
  nfdServer: MAINNET_NFD_SERVER,
}
const TESTNET_CONFIG: NetworkConfig = {
  algodToken: TESTNET_ALGOD_TOKEN,
  algodServer: TESTNET_ALGOD_SERVER,
  algodPort: TESTNET_ALGOD_PORT,
  blockExplorer: TESTNET_BLOCK_EXPLORER,
  walletConnect2ChainID: TESTNET_WALLETCONNECT_CHAIN_ID,
  peraChainId: TESTNET_PERA_CHAIN_ID,
  nfdServer: TESTNET_NFD_SERVER,
}
const BETANET_CONFIG: NetworkConfig = {
  algodToken: BETANET_ALGOD_TOKEN,
  algodServer: BETANET_ALGOD_SERVER,
  algodPort: BETANET_ALGOD_PORT,
  blockExplorer: BETANET_BLOCK_EXPLORER,
  walletConnect2ChainID: BETANET_WALLETCONNECT_CHAIN_ID,
  peraChainId: BETANET_PERA_CHAIN_ID,
  nfdServer: BETANET_NFD_SERVER,
}
const LOCALNET_CONFIG: NetworkConfig = {
  algodToken: LOCALNET_ALGOD_TOKEN,
  algodServer: LOCALNET_ALGOD_SERVER,
  algodPort: LOCALNET_ALGOD_PORT,
  blockExplorer: LOCALNET_BLOCK_EXPLORER,
  walletConnect2ChainID: LOCALNET_WALLETCONNECT_CHAIN_ID,
  peraChainId: LOCALNET_PERA_CHAIN_ID,
  nfdServer: LOCALNET_NFD_SERVER,
}

const networkConfigs: NetworkConfigs = {
  MainNet: MAINNET_CONFIG,
  TestNet: TESTNET_CONFIG,
  BetaNet: BETANET_CONFIG,
  LocalNet: LOCALNET_CONFIG,
}

const networkNames = Object.keys(networkConfigs) as NetworkName[]

function useNetwork() {
  const [activeNetwork, setActiveNetwork] = createSignal<NetworkName>('TestNet')

  const algodClient = createMemo(() => {
    const config = networkConfigs[activeNetwork()]
    const token = config.algodToken ? config.algodToken : ''
    const server = config.algodServer ? config.algodServer : ''
    const port = config.algodPort ? config.algodPort : ''
    return new Algodv2(token, server, port)
  })

  function getAddrUrl(addr: string): string {
    return `${networkConfigs[activeNetwork()].blockExplorer}/address/${addr}`
  }
  function getAsaUrl(index: number): string {
    return `${networkConfigs[activeNetwork()].blockExplorer}/asset/${index}`
  }
  function getTxUrl(txId: string): string {
    return `${networkConfigs[activeNetwork()].blockExplorer}/tx/${txId}`
  }
  function getPeraChainId(): 416001 | 416002 | 416003 | 4160 {
    return networkConfigs[activeNetwork()].peraChainId
  }
  function getWalletConnect2ChainId(): string {
    return networkConfigs[activeNetwork()].walletConnect2ChainID
  }

  async function getAccountInfo(address: string) {
    const accountInfo = await algodClient().accountInformation(address).do()
    return accountInfo as AccountInfo
  }

  async function confirmTransaction(txId: string, timeout = 4) {
    const confirmation = (await waitForConfirmation(algodClient(), txId, timeout)) as ConfirmedTxn

    return { txId, ...confirmation }
  }

  async function getAssetData(assetData: AssetData): Promise<AssetData> {
    if (assetData.id > 0) {
      try {
        const asset = { ...assetData }
        const { params } = await algodClient().getAssetByID(asset.id).do()
        asset.name = params.name
        asset.unitName = params['unit-name']
        asset.url = params.url
        asset.decimals = params.decimals
        return asset
      } catch (e) {
        console.error('Error getting asset data: ', e)
        return assetData
      }
    } else {
      return assetData
    }
  }

  async function getAssetDataFromBigInts(assetIndex: BigInt, amount: BigInt): Promise<AssetData> {
    if (Number(assetIndex) == 0) {
      const newAlgoAsset = makeAlgoAssetDataObj(Number(amount))
      return newAlgoAsset
    } else {
      return await getAssetData(makeAssetDataObj(Number(assetIndex), Number(amount)))
    }
  }

  return {
    algodClient,
    activeNetwork,
    setActiveNetwork,
    getAddrUrl,
    getAsaUrl,
    getTxUrl,
    getChainId: getPeraChainId,
    getWalletConnect2ChainId,
    getAccountInfo,
    getAssetData,
    getAssetDataFromBigInts,
    confirmTransaction,
    networkConfigs,
    networkNames,
  }
}

export default createRoot(useNetwork)
