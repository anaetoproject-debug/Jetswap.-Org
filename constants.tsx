
import { Chain, Token, NewsItem } from './types.ts';

export const CHAINS: Chain[] = [
  { id: 'ethereum', name: 'Ethereum', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', color: '#627EEA' },
  { id: 'bsc', name: 'BNB Smart Chain', icon: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png', color: '#F3BA2F' },
  { id: 'solana', name: 'Solana', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', color: '#14F195' },
  { id: 'base', name: 'Base', icon: 'https://avatars.githubusercontent.com/u/108554348?v=4', color: '#0052FF' },
  { id: 'tron', name: 'Tron', icon: 'https://cryptologos.cc/logos/tron-trx-logo.png', color: '#FF0013' },
  { id: 'avalanche', name: 'Avalanche C-chain', icon: 'https://cryptologos.cc/logos/avalanche-avax-logo.png', color: '#E84142' },
  { id: 'ton', name: 'Ton', icon: 'https://cryptologos.cc/logos/toncoin-ton-logo.png', color: '#0088CC' },
  { id: 'cronos', name: 'Cronos chain', icon: 'https://cryptologos.cc/logos/crypto-com-coin-cro-logo.png', color: '#002D74' },
  { id: 'arbitrum', name: 'Arbitrum', icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png', color: '#28A0F0' },
  { id: 'polygon', name: 'Polygon', icon: 'https://cryptologos.cc/logos/polygon-matic-logo.png', color: '#8247E5' },
  { id: 'gnosis', name: 'Gnosis chain', icon: 'https://cryptologos.cc/logos/gnosis-gno-logo.png', color: '#00a68c' },
  { id: 'optimism', name: 'OP Mainnet', icon: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png', color: '#FF0420' },
];

export const TOKENS: Token[] = [
  { symbol: 'ETH', name: 'Ethereum', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', decimals: 18 },
  { symbol: 'BNB', name: 'Binance Coin', icon: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png', decimals: 18 },
  { symbol: 'SOL', name: 'Solana', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', decimals: 9 },
  { symbol: 'TRX', name: 'Tron', icon: 'https://cryptologos.cc/logos/tron-trx-logo.png', decimals: 6 },
  { symbol: 'AVAX', name: 'Avalanche', icon: 'https://cryptologos.cc/logos/avalanche-avax-logo.png', decimals: 18 },
  { symbol: 'TON', name: 'Toncoin', icon: 'https://cryptologos.cc/logos/toncoin-ton-logo.png', decimals: 9 },
  { symbol: 'CRO', name: 'Cronos', icon: 'https://cryptologos.cc/logos/crypto-com-coin-cro-logo.png', decimals: 18 },
  { symbol: 'ARB', name: 'Arbitrum', icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png', decimals: 18 },
  { symbol: 'MATIC', name: 'Polygon', icon: 'https://cryptologos.cc/logos/polygon-matic-logo.png', decimals: 18 },
  { symbol: 'GNO', name: 'Gnosis', icon: 'https://cryptologos.cc/logos/gnosis-gno-logo.png', decimals: 18 },
  { symbol: 'OP', name: 'Optimism', icon: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png', decimals: 18 },
  { symbol: 'USDC', name: 'USD Coin', icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', decimals: 6 },
  { symbol: 'USDT', name: 'Tether', icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png', decimals: 6 },
];

export interface WalletProvider {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'Popular' | 'Multi-Chain' | 'Solana' | 'Smart' | 'Hardware' | 'Exchange';
  recommended?: boolean;
}

export const WALLETS: WalletProvider[] = [
  { id: 'metamask', name: 'MetaMask', icon: 'https://cryptologos.cc/logos/metamask-mask-logo.png', description: 'Ethereum Gateway', category: 'Popular', recommended: true },
  { id: 'coinbase', name: 'Coinbase', icon: 'https://cryptologos.cc/logos/coinbase-wallet-coin-logo.png', description: 'Easy & Secure', category: 'Popular', recommended: true },
  { id: 'phantom', name: 'Phantom', icon: 'https://raw.githubusercontent.com/phantom-labs/brand-assets/main/logos/icon/purple.png', description: 'Solana & More', category: 'Popular', recommended: true },
  { id: 'trust', name: 'Trust Wallet', icon: 'https://trustwallet.com/assets/images/media/assets/TWT.png', description: 'Multi-chain Mobile', category: 'Popular' },
  { id: 'binance', name: 'Binance Web3', icon: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png', description: 'Exchange Wallet', category: 'Popular' },
  { id: 'okx', name: 'OKX Wallet', icon: 'https://www.okx.com/cdn/assets/imgs/221/9E9277A8A3A8A3A8.png', description: 'Powerful DEX tools', category: 'Multi-Chain' },
  { id: 'zerion', name: 'Zerion', icon: 'https://app.zerion.io/images/icons/zerion.png', description: 'Smart Portfolio', category: 'Multi-Chain' },
  { id: 'rabby', name: 'Rabby', icon: 'https://rabby.io/assets/images/logo.png', description: 'Better for Dapps', category: 'Multi-Chain', recommended: true },
  { id: 'argent', name: 'Argent', icon: 'https://www.argent.xyz/favicon.ico', description: 'L2 Smart Wallet', category: 'Smart' },
  { id: 'rainbow', name: 'Rainbow', icon: 'https://rainbow.me/favicon.png', description: 'Social & Fun', category: 'Multi-Chain' },
  { id: 'ledger', name: 'Ledger Live', icon: 'https://www.ledger.com/wp-content/uploads/2021/11/Ledger_logo_600x600.png', description: 'Hardware Security', category: 'Hardware' },
  { id: 'trezor', name: 'Trezor', icon: 'https://trezor.io/static/images/trezor-logo.png', description: 'Original Hardware', category: 'Hardware' },
  { id: 'safe', name: 'Safe', icon: 'https://safe.global/favicon.ico', description: 'Multi-sig Account', category: 'Smart' },
  { id: 'exodus', name: 'Exodus', icon: 'https://www.exodus.com/favicon.ico', description: 'Desktop & Mobile', category: 'Multi-Chain' },
  { id: 'backpack', name: 'Backpack', icon: 'https://backpack.app/favicon.ico', description: 'Solana Optimized', category: 'Solana' },
  { id: 'glow', name: 'Glow', icon: 'https://glow.app/favicon.ico', description: 'Fast Solana', category: 'Solana' },
  { id: 'solflare', name: 'Solflare', icon: 'https://solflare.com/favicon.ico', description: 'Legacy Solana', category: 'Solana' },
  { id: 'bitget', name: 'Bitget Wallet', icon: 'https://www.bitget.com/favicon.ico', description: 'Exchange Integrated', category: 'Exchange' },
  { id: 'kraken', name: 'Kraken Wallet', icon: 'https://www.kraken.com/favicon.ico', description: 'Official Kraken', category: 'Exchange' },
  { id: 'bybit', name: 'Bybit Wallet', icon: 'https://www.bybit.com/favicon.ico', description: 'Unified Access', category: 'Exchange' },
];

export const MOCK_NEWS: NewsItem[] = [
  {
    id: 'n1',
    title: 'JetSwap v2.5 Protocol Upgrade Live on Mainnet',
    summary: 'JetSwap announces the successful deployment of v2.5, featuring 40% lower gas fees on Arbitrum and Base.',
    fullText: 'The v2.5 upgrade introduces a new routing engine that optimizes gas usage across Layer 2 solutions.',
    category: 'Platform Updates',
    timestamp: '2 hours ago',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1000',
    important: true,
    trending: true
  },
  {
    id: 'n2',
    title: 'New Partnership: JetSwap x Solana Foundation',
    summary: 'Strategic alliance aimed at scaling cross-chain liquidity between Ethereum and Solana ecosystem.',
    fullText: 'We are thrilled to partner with the Solana Foundation...',
    category: 'Announcements',
    timestamp: '5 hours ago',
    image: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?auto=format&fit=crop&q=80&w=1000',
    trending: true
  }
];
