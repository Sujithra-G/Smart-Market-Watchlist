import { StockDetailsPage } from '@/components/market-views'
export default async function Page({ params }: { params: Promise<{ symbol: string }> }) { const { symbol } = await params; return <StockDetailsPage symbol={symbol} /> }
