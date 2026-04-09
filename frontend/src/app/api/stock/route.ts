import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8080';

// Push price data to Java backend asynchronously (for DB caching + alert checks)
async function pushToBackend(data: {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  marketTime: string | null;
}) {
  try {
    await fetch(`${BACKEND_URL}/api/stock/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Non-critical - backend may be offline, data still served fresh from Yahoo
  }
}

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'symbol is required' }, { status: 400 });
  }

  const normalized = symbol.trim().toUpperCase();

  try {
    const quote = await yahooFinance.quote(normalized, {}, { validateResult: false });

    if (!quote || !quote.regularMarketPrice) {
      return NextResponse.json({ error: `Symbol not found: ${normalized}` }, { status: 404 });
    }

    const result = {
      symbol: quote.symbol ?? normalized,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange ?? 0,
      changePercent: quote.regularMarketChangePercent ?? 0,
      currency: quote.currency ?? 'USD',
      marketTime: quote.regularMarketTime?.toISOString() ?? null,
      updatedAt: new Date().toISOString(),
      source: 'market',
    };

    // Push to backend in background (non-blocking)
    pushToBackend(result);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error(`[api/stock] Error fetching ${normalized}:`, err?.message ?? err);
    return NextResponse.json(
      { error: `Failed to fetch stock data for ${normalized}` },
      { status: 502 }
    );
  }
}
