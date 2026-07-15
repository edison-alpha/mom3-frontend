import type { TimeRange } from "@/components/ui/mini-chart";

export type PositionKind = "Yield";
export type Risk = "Low" | "Medium" | "High";

export type AssetDetail = {
  slug: string;
  symbol: string;
  name: string;
  amount: string;
  value: string;
  chain: string;
  icon: string;
  allocation: string;
  change: string;
  price: string;
  avgCost: string;
  detail: string;
  chartData: Record<TimeRange, number[]>;
};

export type PositionDetail = {
  slug: string;
  asset: string;
  protocol: string;
  balance: string;
  detail: string;
  kind: PositionKind;
  risk: Risk;
  health: number;
  summary: string;
  icon: string;
  protocolIcon: string;
  protocolTone: string;
  action: string;
  exposure: string;
  chartData: Record<TimeRange, number[]>;
};

export type MarketDetail = {
  slug: string;
  chainId?: number;
  asset: string;
  protocol: string;
  primary: string;
  secondary: string;
  icon: string;
  color: string;
  positive?: boolean;
  category: "Yield" | "Risk";
  tvl: string;
  utilization: string;
  risk: Risk;
  description: string;
  chartData: Record<TimeRange, number[]>;
};

const chartSeries: Record<string, Record<TimeRange, number[]>> = {
  steady: {
    "1D": [0, 0.1, 0.08, 0.18, 0.22, 0.2, 0.28],
    "1W": [0, 0.4, 0.35, 0.7, 0.92, 1.1, 1.24],
    "1M": [0, 1.2, 1.8, 2.4, 3.1, 3.8, 4.2],
    "1Y": [0, 3.2, 5.6, 8.4, 11.8, 14.6, 18.2],
  },
  volatile: {
    "1D": [0, -0.4, 0.8, 0.2, 1.2, 0.6, 1.7],
    "1W": [0, 2.2, -1.4, 3.8, 2.1, 5.2, 4.4],
    "1M": [0, 4.8, 1.2, 7.2, 9.4, 6.6, 12.8],
    "1Y": [0, 18, -6, 24, 42, 31, 58],
  },
  risk: {
    "1D": [0, -0.8, -0.4, -1.4, -0.9, -1.8, -1.2],
    "1W": [0, -2.2, -1.5, -4.1, -3.4, -5.6, -4.8],
    "1M": [0, -4.8, -2.2, -7.4, -9.8, -6.1, -11.2],
    "1Y": [0, 8, -12, 4, -18, -6, -24],
  },
};

export const assetDetails: AssetDetail[] = [
  {
    slug: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    amount: "1,420.00 USDC",
    value: "$1,420.00",
    chain: "Base",
    icon: "cryptocurrency-color:usdc",
    allocation: "56.8%",
    change: "+0.24%",
    price: "$1.00",
    avgCost: "$1.00",
    detail: "Stablecoin utama untuk deposit, yield, dan pembayaran harian.",
    chartData: chartSeries.steady,
  },
  {
    slug: "eth",
    symbol: "ETH",
    name: "Ethereum",
    amount: "0.42 ETH",
    value: "$1,046.80",
    chain: "Arbitrum",
    icon: "cryptocurrency-color:eth",
    allocation: "41.9%",
    change: "+1.72%",
    price: "$2,492.38",
    avgCost: "$2,420.00",
    detail: "Aset volatil untuk collateral dan eksposur pertumbuhan.",
    chartData: chartSeries.volatile,
  },
  {
    slug: "usde",
    symbol: "USDe",
    name: "Ethena USDe",
    amount: "620.00 USDe",
    value: "$620.00",
    chain: "Ethereum",
    icon: "token-branded:ethena",
    allocation: "24.8%",
    change: "+0.41%",
    price: "$1.00",
    avgCost: "$0.99",
    detail: "Stable yield asset dengan risiko protokol yang perlu dipantau.",
    chartData: chartSeries.steady,
  },
  {
    slug: "usdt",
    symbol: "USDT",
    name: "Tether USD",
    amount: "430.00 USDT",
    value: "$430.00",
    chain: "Morpho",
    icon: "cryptocurrency-color:usdt",
    allocation: "17.2%",
    change: "+0.12%",
    price: "$1.00",
    avgCost: "$1.00",
    detail: "Stablecoin cadangan untuk yield konservatif dan likuiditas.",
    chartData: chartSeries.steady,
  },
  {
    slug: "pt-susde",
    symbol: "PT-sUSDe",
    name: "Pendle Principal Token",
    amount: "210.00 PT",
    value: "$210.00",
    chain: "Pendle",
    icon: "token-branded:pendle",
    allocation: "8.4%",
    change: "-1.12%",
    price: "$1.00",
    avgCost: "$1.04",
    detail: "Yield token dengan sensitivitas terhadap expiry dan likuiditas market.",
    chartData: chartSeries.risk,
  },
  {
    slug: "zorb",
    symbol: "ZORB",
    name: "Zora Position",
    amount: "184.20 ZORB",
    value: "$184.20",
    chain: "Zora",
    icon: "simple-icons:zora",
    allocation: "7.4%",
    change: "-4.80%",
    price: "$1.00",
    avgCost: "$1.18",
    detail: "Eksperimen creator yield dengan volatilitas dan likuiditas lebih tinggi.",
    chartData: chartSeries.risk,
  },
];

export const positionDetails: PositionDetail[] = [
  {
    slug: "usdc-aave-v3-yield",
    asset: "USDC",
    protocol: "Aave v3",
    balance: "$1,250.00",
    detail: "5.15% APY",
    kind: "Yield",
    risk: "Low",
    health: 94,
    summary: "Stable USDC supply on Aave with deep liquidity and low volatility.",
    icon: "cryptocurrency-color:usdc",
    protocolIcon: "simple-icons:aave",
    protocolTone: "text-[#B650F2]",
    action: "Keep supplied",
    exposure: "$1,250 stablecoin",
    chartData: chartSeries.steady,
  },
  {
    slug: "eth-aave-v3-yield",
    asset: "ETH",
    protocol: "Aave v3",
    balance: "0.42 ETH",
    detail: "Adaptive yield allocation",
    kind: "Yield",
    risk: "Medium",
    health: 82,
    summary: "ETH collateral position is healthy, but should be watched during volatility.",
    icon: "cryptocurrency-color:eth",
    protocolIcon: "simple-icons:aave",
    protocolTone: "text-[#B650F2]",
    action: "Watch collateral",
    exposure: "0.42 ETH collateral",
    chartData: chartSeries.volatile,
  },
  {
    slug: "usde-ethena-yield",
    asset: "USDe",
    protocol: "Ethena",
    balance: "$620.00",
    detail: "8.40% APY",
    kind: "Yield",
    risk: "Medium",
    health: 78,
    summary: "Higher yield stable strategy with additional protocol and market structure risk.",
    icon: "token-branded:ethena",
    protocolIcon: "simple-icons:ethereum",
    protocolTone: "text-[#8EA7FF]",
    action: "Limit size",
    exposure: "$620 synthetic stable",
    chartData: chartSeries.steady,
  },
  {
    slug: "usdt-morpho-yield",
    asset: "USDT",
    protocol: "Morpho",
    balance: "$430.00",
    detail: "4.88% APY",
    kind: "Yield",
    risk: "Low",
    health: 91,
    summary: "Conservative yield market with strong liquidity buffers.",
    icon: "cryptocurrency-color:usdt",
    protocolIcon: "simple-icons:morpho",
    protocolTone: "text-[#2E5BFF]",
    action: "Keep supplied",
    exposure: "$430 stablecoin",
    chartData: chartSeries.steady,
  },
  {
    slug: "usdc-uniswap-yield",
    asset: "USDC",
    protocol: "Uniswap",
    balance: "$360.00",
    detail: "6.44% APY",
    kind: "Yield",
    risk: "Medium",
    health: 74,
    summary: "LP-style yield has fee upside, but can move with pool conditions.",
    icon: "cryptocurrency-color:usdc",
    protocolIcon: "simple-icons:uniswap",
    protocolTone: "text-[#FF007A]",
    action: "Review fees",
    exposure: "$360 LP range",
    chartData: chartSeries.volatile,
  },
  {
    slug: "zorb-zora-yield",
    asset: "ZORB",
    protocol: "Zora",
    balance: "$184.20",
    detail: "Creator yield",
    kind: "Yield",
    risk: "High",
    health: 63,
    summary: "Experimental creator yield position with higher variance and lower liquidity.",
    icon: "simple-icons:zora",
    protocolIcon: "simple-icons:zora",
    protocolTone: "text-white",
    action: "Reduce exposure",
    exposure: "$184 creator yield",
    chartData: chartSeries.risk,
  },
];

export const marketDetails: MarketDetail[] = [
  {
    slug: "yield-usdc-aave-v3",
    chainId: 42161,
    asset: "USDC",
    protocol: "Aave v3",
    primary: "5.15% APY",
    secondary: "Low risk",
    icon: "cryptocurrency-color:usdc",
    color: "bg-[#2775CA]",
    positive: true,
    category: "Yield",
    tvl: "$184.2M",
    utilization: "68%",
    risk: "Low",
    description: "Stable USDC yield with deep liquidity and predictable returns.",
    chartData: chartSeries.steady,
  },
  {
    slug: "yield-eth-aerodrome",
    asset: "ETH",
    protocol: "Aerodrome",
    primary: "3.42% APY",
    secondary: "Blue-chip",
    icon: "cryptocurrency-color:eth",
    color: "bg-[#627EEA]",
    positive: true,
    category: "Yield",
    tvl: "$96.4M",
    utilization: "54%",
    risk: "Low",
    description: "Blue-chip liquidity strategy with transparent, market-driven yield.",
    chartData: chartSeries.volatile,
  },
  {
    slug: "yield-usdt-morpho",
    asset: "USDT",
    protocol: "Morpho",
    primary: "4.88% APY",
    secondary: "Stablecoin",
    icon: "cryptocurrency-color:usdt",
    color: "bg-[#26A17B]",
    positive: true,
    category: "Yield",
    tvl: "$72.8M",
    utilization: "61%",
    risk: "Low",
    description: "Conservative stablecoin yield route with steady utilization.",
    chartData: chartSeries.steady,
  },
  {
    slug: "yield-usdc-base-market",
    asset: "USDC",
    protocol: "Base Market",
    primary: "6.20% APY",
    secondary: "Medium risk",
    icon: "cryptocurrency-color:usdc",
    color: "bg-[#2775CA]",
    category: "Yield",
    tvl: "$42.1M",
    utilization: "80%",
    risk: "Medium",
    description: "Adaptive USDC yield route with market conditions monitored continuously.",
    chartData: chartSeries.volatile,
  },
  {
    slug: "yield-cbeth-aave-v3",
    asset: "cbETH",
    protocol: "Aave v3",
    primary: "2.14% APY",
    secondary: "Medium risk",
    icon: "cryptocurrency-color:eth",
    color: "bg-[#3B33BD]",
    category: "Yield",
    tvl: "$38.6M",
    utilization: "70%",
    risk: "Medium",
    description: "cbETH yield route with moderate rate movement and active monitoring.",
    chartData: chartSeries.volatile,
  },
  {
    slug: "yield-mom-mom3-vault",
    asset: "MOM",
    protocol: "mom3 Vault",
    primary: "9.80% APY",
    secondary: "Beta",
    icon: "solar:stars-bold",
    color: "bg-[#ccff00]",
    category: "Yield",
    tvl: "$4.8M",
    utilization: "46%",
    risk: "High",
    description: "High-upside yield strategy with higher rate uncertainty and smaller liquidity.",
    chartData: chartSeries.risk,
  },
  {
    slug: "risk-pendle-yield-market",
    asset: "Pendle",
    protocol: "Yield Market",
    primary: "High util.",
    secondary: "89% used",
    icon: "token-branded:pendle",
    color: "bg-[#242620]",
    category: "Risk",
    tvl: "$12.6M",
    utilization: "89%",
    risk: "High",
    description: "High utilization can make exits slower and rates less predictable.",
    chartData: chartSeries.risk,
  },
  {
    slug: "risk-ethena-usde-loop",
    asset: "Ethena",
    protocol: "USDe Loop",
    primary: "Medium risk",
    secondary: "Review",
    icon: "token-branded:ethena",
    color: "bg-[#20211f]",
    category: "Risk",
    tvl: "$28.9M",
    utilization: "73%",
    risk: "Medium",
    description: "Yield loop is active but should be reviewed before adding more size.",
    chartData: chartSeries.risk,
  },
];
