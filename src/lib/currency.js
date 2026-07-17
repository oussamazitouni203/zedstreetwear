// Currency display for the storefront. Prices are stored as plain numbers in the
// store's own currency — changing this only changes the symbol/format shown, it
// does NOT convert amounts (there is no FX). The active currency comes from the
// General settings (settings.general.currency).

export const CURRENCIES = {
  USD: { symbol: '$', position: 'prefix' },
  EUR: { symbol: '€', position: 'prefix' },
  GBP: { symbol: '£', position: 'prefix' },
  DZD: { symbol: 'DA', position: 'suffix' },
  MAD: { symbol: 'DH', position: 'suffix' }
};

const DEFAULT = 'USD';

// Pick a valid currency code out of the settings object (falls back to USD).
export function resolveCurrency(settings) {
  const c = settings?.general?.currency;
  return CURRENCIES[c] ? c : DEFAULT;
}

export function currencySymbol(currency = DEFAULT) {
  return (CURRENCIES[currency] || CURRENCIES[DEFAULT]).symbol;
}

// Format a numeric amount in the given currency, e.g. formatMoney(1200, 'DZD') → "1,200 DA".
export function formatMoney(amount, currency = DEFAULT) {
  const c = CURRENCIES[currency] || CURRENCIES[DEFAULT];
  const n = Math.round(Number(amount) || 0).toLocaleString('en-US');
  return c.position === 'suffix' ? `${n} ${c.symbol}` : `${c.symbol}${n}`;
}
