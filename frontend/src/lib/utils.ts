import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatIndianCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return '₹0';
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  let formatted = '';

  if (absValue >= 10000000) {
    formatted = `₹${(absValue / 10000000).toFixed(2).replace(/\.00$/, '')}Cr`;
  } else if (absValue >= 100000) {
    formatted = `₹${(absValue / 100000).toFixed(2).replace(/\.00$/, '')}L`;
  } else if (absValue >= 1000) {
    formatted = `₹${(absValue / 1000).toFixed(2).replace(/\.00$/, '')}K`;
  } else {
    formatted = `₹${absValue.toFixed(0)}`;
  }
  return isNegative ? `-${formatted}` : formatted;
}
