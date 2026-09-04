export type Signal = 'Critical' | 'Important' | 'Worth Watching' | 'Stable'

export type Stock = {
  symbol: string
  name: string
  sector: string
  price: number
  previousVisitPrice: number
  dayChange: number
  volume: number
  averageVolume: number
  volatility: number
  history: number[]
}

export const MARKET_DATA: Stock[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy', price: 2938.4, previousVisitPrice: 2803.3, dayChange: 4.82, volume: 2.4, averageVolume: 1.15, volatility: 2.8, history: [2762, 2794, 2770, 2811, 2803, 2860, 2897, 2938] },
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'Technology', price: 3812.15, previousVisitPrice: 3895.55, dayChange: -2.14, volume: 1.1, averageVolume: 0.85, volatility: 1.9, history: [3920, 3890, 3912, 3870, 3895, 3852, 3836, 3812] },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Financials', price: 1742.8, previousVisitPrice: 1719.4, dayChange: 1.36, volume: 3.8, averageVolume: 3.6, volatility: 1.1, history: [1704, 1712, 1709, 1720, 1719, 1730, 1738, 1743] },
  { symbol: 'INFY', name: 'Infosys', sector: 'Technology', price: 1498.6, previousVisitPrice: 1444.9, dayChange: 3.72, volume: 1.9, averageVolume: 1.05, volatility: 2.4, history: [1430, 1445, 1438, 1461, 1445, 1470, 1484, 1499] },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', sector: 'Financials', price: 1224.25, previousVisitPrice: 1214.05, dayChange: 0.84, volume: 2.1, averageVolume: 2.0, volatility: 0.9, history: [1205, 1209, 1212, 1214, 1218, 1216, 1221, 1224] },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Financials', price: 812.3, previousVisitPrice: 795.2, dayChange: 2.15, volume: 5.4, averageVolume: 3.2, volatility: 2.1, history: [770, 778, 785, 795, 790, 802, 808, 812] },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', sector: 'Automotive', price: 986.45, previousVisitPrice: 1004.1, dayChange: -1.76, volume: 3.7, averageVolume: 2.4, volatility: 2.7, history: [1022, 1015, 1009, 1004, 998, 1001, 990, 986] },
  { symbol: 'WIPRO', name: 'Wipro', sector: 'Technology', price: 542.8, previousVisitPrice: 536.2, dayChange: 1.23, volume: 1.8, averageVolume: 1.4, volatility: 1.5, history: [531, 534, 532, 536, 539, 541, 540, 543] },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', sector: 'Telecom', price: 1788.6, previousVisitPrice: 1751.4, dayChange: 2.12, volume: 2.9, averageVolume: 2.1, volatility: 1.8, history: [1720, 1734, 1748, 1751, 1762, 1770, 1781, 1789] },
  { symbol: 'LT', name: 'Larsen & Toubro', sector: 'Industrials', price: 3642.2, previousVisitPrice: 3610.5, dayChange: 0.88, volume: 1.6, averageVolume: 1.3, volatility: 1.2, history: [3570, 3590, 3602, 3611, 3625, 3618, 3630, 3642] },
]

export function attentionScore(stock: Stock, settings = { priceThreshold: 2, minimumScore: 40, volumeSensitivity: 1.5 }) {
  const sinceVisit = Math.abs((stock.price - stock.previousVisitPrice) / stock.previousVisitPrice * 100)
  const volumeRatio = stock.volume / stock.averageVolume
  return Math.min(100, Math.round((sinceVisit / settings.priceThreshold) * 45 + Math.max(0, volumeRatio - 1) * 25 + stock.volatility * 7))
}
export function signalFor(stock: Stock, settings?: Parameters<typeof attentionScore>[1]): Signal {
  const score = attentionScore(stock, settings)
  const minimum = settings?.minimumScore ?? 40
  if (score < minimum) return 'Stable'
  if (score >= 75) return 'Critical'
  if (score >= 55) return 'Important'
  if (score >= 40) return 'Worth Watching'
  return 'Stable'
}
export function getStock(symbol: string) { return MARKET_DATA.find((stock) => stock.symbol === symbol.toUpperCase()) ?? MARKET_DATA[0] }
export function changeSinceVisit(stock: Stock) { return ((stock.price - stock.previousVisitPrice) / stock.previousVisitPrice) * 100 }
export const formatPrice = (value: number) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

export const defaultSymbols = MARKET_DATA.map((stock) => stock.symbol)
export const explanationFor = (stock: Stock, settings?: Parameters<typeof attentionScore>[1]) => {
  const ratio = stock.volume / stock.averageVolume
  const change = Math.abs(changeSinceVisit(stock))
  const reasons = []
  if (change >= (settings?.priceThreshold ?? 2)) reasons.push(`${change.toFixed(1)}% move since your last visit`)
  if (ratio >= (settings?.volumeSensitivity ?? 1.5)) reasons.push(`${ratio.toFixed(1)}x average volume`)
  if (stock.volatility >= 2) reasons.push('elevated volatility')
  return reasons.length ? reasons.join(' and ') : 'Price and trading activity remain within your normal range.'
}

export type Settings = { priceThreshold: number; minimumScore: number; volumeSensitivity: number; demoMode: boolean; refreshFrequency: string; freshness: string }
export const DEFAULT_SETTINGS: Settings = { priceThreshold: 2, minimumScore: 40, volumeSensitivity: 1.5, demoMode: true, refreshFrequency: '15 minutes', freshness: 'Prefer live data' }
export function loadSettings(): Settings { if (typeof window === 'undefined') return DEFAULT_SETTINGS; try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem('smartwatch-settings') ?? '{}') } } catch { return DEFAULT_SETTINGS } }
export function saveSettings(settings: Settings) { localStorage.setItem('smartwatch-settings', JSON.stringify(settings)) }
