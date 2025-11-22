import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to format dates in Bengali numerals with Gregorian calendar
export function formatDateBengali(date: string | Date): string {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear().toString();
  
  const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const dateString = `${day}/${month}/${year}`;
  
  return dateString.split('').map(char => {
    const digit = parseInt(char);
    return isNaN(digit) ? char : bengaliNumerals[digit];
  }).join('');
}
