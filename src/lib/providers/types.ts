import type { MarketType } from '@/lib/display/displayPolicy';

export type ProviderResult<T> = {
  source: string;
  basis: string;
  fetchedAt: string;
  data: T;
  raw?: unknown;
};

export type NormalizedQuote = {
  symbol: string;
  market: MarketType;
  price?: number;
  changePct?: number;
  volume?: number;
  amount?: number;
  basis: string;
  source: string;
};

export type NormalizedCandle = {
  symbol: string;
  market: MarketType;
  time: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  amount?: number;
  source: string;
};

export function emptyProviderResult<T>(source: string, basis: string, data: T): ProviderResult<T> {
  return {
    source,
    basis,
    fetchedAt: new Date().toISOString(),
    data,
  };
}
