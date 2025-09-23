import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * A utility function to merge Tailwind CSS classes, resolving conflicts.
 * It uses `clsx` to conditionally apply classes and `tailwind-merge` to merge them.
 * @param {...ClassValue[]} inputs - A list of class values to be merged.
 * @returns {string} The merged string of CSS classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
