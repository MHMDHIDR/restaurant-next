export function formatPrice(price: number, minimumFractionDigits = 2) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits,
  }).format(price)
}
