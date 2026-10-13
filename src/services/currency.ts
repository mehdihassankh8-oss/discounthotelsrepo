export type SupportedCurrency = 'PKR' | 'USD' | 'AED' | 'SAR' | 'GBP';

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  exchangeRateFromPKR: number; // 1 PKR = X foreign currency
}

export const CURRENCIES: Record<SupportedCurrency, CurrencyConfig> = {
  PKR: {
    code: 'PKR',
    symbol: 'PKR ',
    name: 'Pakistani Rupee',
    exchangeRateFromPKR: 1,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    exchangeRateFromPKR: 1 / 278.5,
  },
  AED: {
    code: 'AED',
    symbol: 'AED ',
    name: 'UAE Dirham',
    exchangeRateFromPKR: 1 / 75.8,
  },
  SAR: {
    code: 'SAR',
    symbol: 'SAR ',
    name: 'Saudi Riyal',
    exchangeRateFromPKR: 1 / 74.2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    exchangeRateFromPKR: 1 / 355.0,
  },
};

export function formatPrice(amountInPKR: number, currency: SupportedCurrency = 'PKR'): string {
  const config = CURRENCIES[currency] || CURRENCIES.PKR;
  const converted = amountInPKR * config.exchangeRateFromPKR;

  if (currency === 'PKR') {
    return `${config.symbol}${Math.round(converted).toLocaleString('en-PK')}`;
  }

  return `${config.symbol}${Math.round(converted).toLocaleString('en-US')}`;
}
