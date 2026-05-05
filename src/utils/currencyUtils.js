export const CURRENCY_LABEL = "NPR";
export const PRICE_STEP = 500;

export function formatPrice(value) {
  const numericValue = Number(value || 0);

  return `${CURRENCY_LABEL} ${numericValue.toLocaleString()}`;
}
