'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { MARKET_DATA, Stock } from '@/lib/market-data'

type Watchlist = { id: string; name: string; symbols: string[] }
type WatchlistContextValue = { watchlists: Watchlist[]; selectedId: string; stocks: Stock[]; hydrated: boolean; selectWatchlist: (id: string) => void; addStock: (symbol: string) => boolean; removeStock: (symbol: string) => void; createWatchlist: (name: string) => void; renameWatchlist: (name: string) => void; deleteWatchlist: () => boolean }
const KEY = 'smartwatch-watchlists'
const initial: Watchlist[] = [{ id: 'default', name: 'My Watchlist', symbols: MARKET_DATA.map(s => s.symbol) }]
const WatchlistContext = createContext<WatchlistContextValue | null>(null)
export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlists, setWatchlists] = useState(initial); const [selectedId, setSelectedId] = useState('default'); const [hydrated, setHydrated] = useState(false)
  useEffect(() => { try { const saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (Array.isArray(saved?.watchlists) && saved.watchlists.length) { setWatchlists(saved.watchlists); setSelectedId(saved.selectedId || saved.watchlists[0].id) } } catch {} setHydrated(true) }, [])
  useEffect(() => { if (hydrated) localStorage.setItem(KEY, JSON.stringify({ watchlists, selectedId })) }, [watchlists, selectedId, hydrated])
  const current = watchlists.find(w => w.id === selectedId) || watchlists[0]
  const stocks = useMemo(() => current.symbols.map(symbol => MARKET_DATA.find(stock => stock.symbol === symbol)).filter(Boolean) as Stock[], [current])
  const value = { watchlists, selectedId: current.id, stocks, hydrated, selectWatchlist: (id: string) => setSelectedId(id), addStock: (symbol: string) => { const exists = current.symbols.includes(symbol); if (exists) return false; setWatchlists(list => list.map(w => w.id === current.id ? { ...w, symbols: [...w.symbols, symbol] } : w)); return true }, removeStock: (symbol: string) => setWatchlists(list => list.map(w => w.id === current.id ? { ...w, symbols: w.symbols.filter(s => s !== symbol) } : w)), createWatchlist: (name: string) => { const id = `list-${Date.now()}`; setWatchlists(list => [...list, { id, name: name.trim() || 'New Watchlist', symbols: [] }]); setSelectedId(id) }, renameWatchlist: (name: string) => setWatchlists(list => list.map(w => w.id === current.id ? { ...w, name: name.trim() || w.name } : w)), deleteWatchlist: () => { if (watchlists.length === 1) return false; const next = watchlists.filter(w => w.id !== current.id); setWatchlists(next); setSelectedId(next[0].id); return true } }
  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>
}
export function useWatchlists() { const value = useContext(WatchlistContext); if (!value) throw new Error('useWatchlists must be used inside WatchlistProvider'); return value }
export const STOCK_CATALOG = MARKET_DATA
