// utils/number.ts
//
// Pure, unit-testable number formatting used by InputDecimalComponent.
//
// IMPORTANT — the bug this fixes:
//   The previous inline formatter did `value.toFixed(dp).replace(/\.?0+$/, "")`
//   to drop insignificant decimal zeros. That regex also stripped trailing
//   zeros from INTEGERS that have no decimal point, so 180 -> "18", 70 -> "7",
//   100 -> "1". Combined with a unit prefix it produced "cm 18" for a height
//   of 180. We only strip trailing zeros that live AFTER a decimal point.

export interface FormatDecimalOptions {
  decimalPlaces?: number;
  thousandSeparator?: boolean;
}

export function formatDecimalDisplay(
  value: number | string | null | undefined,
  options: FormatDecimalOptions = {},
): string {
  if (value === undefined || value === null || value === "") return "";

  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "";

  const decimalPlaces = options.decimalPlaces ?? 2;
  let formatted = num.toFixed(decimalPlaces);

  // Strip insignificant trailing zeros ONLY within the fractional part.
  // "70.00" -> "70", "70.50" -> "70.5", "180" -> "180" (untouched), "100" -> "100".
  if (formatted.includes(".")) {
    formatted = formatted.replace(/0+$/, "").replace(/\.$/, "");
  }

  if (options.thousandSeparator && formatted !== "") {
    const parts = formatted.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    formatted = parts.join(".");
  }

  return formatted;
}
