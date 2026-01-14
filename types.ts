
export enum ThemeVariant {
  DARK_FUTURISTIC = 'DARK_FUTURISTIC',
  GRADIENT_PREMIUM = 'GRADIENT_PREMIUM'
}

export interface Chain {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Token {
  symbol: string;
  name: string;
  icon: string;
  decimals: number;
}

export enum TransactionStatus {
  IDLE = 'IDLE',
  CONFIRMING = 'CONFIRMING',
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  FLAGGED = 'FLAGGED'
}

export interface SwapState {
  sourceChain: Chain;
  destChain: Chain;
  sourceToken: Token;
  destToken: Token;
  amount: string;
  estimatedOutput: string;
}

export interface PriceAlert {
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  active: boolean;
}

export interface UserProfile {
  id: string;
  method: 'wallet' | 'email' | 'social' | 'web3-profile';
  identifier: string; // email, wallet address, or handle
  name?: string;
  avatar?: string;
  role?: 'user' | 'admin';
  isPilotBridgeAuthorized?: boolean;
  isSubscribed?: boolean;
}

export type NewsCategory = 'Headline' | 'Platform Updates' | 'Guides' | 'Announcements' | 'Market News';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  fullText: string;
  category: NewsCategory;
  timestamp: string;
  image?: string;
  trending?: boolean;
  important?: boolean;
  source?: string;
  url?: string;
}

export interface CMCQuote {
  price: number;
  volume_24h: number;
  percent_change_24h: number;
  market_cap: number;
  last_updated: string;
}
