import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) {
    console.warn(`Invalid amount passed to formatCurrency: ${amount}`);
    return "NaN"; // Or return "₹0.00"
  }

  // Format for Indian Rupees (INR)
  return new Intl.NumberFormat('en-IN', { // Use Indian English locale for formatting conventions
    style: 'currency',
    currency: 'INR', // Change currency code to INR
    minimumFractionDigits: 2
  }).format(numericAmount);
}
