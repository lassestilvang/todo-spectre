import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fuzzy matching utility for search functionality
export function fuzzyMatch(query: string, text: string): number {
  if (!query || !text) return 0

  const queryLower = query.toLowerCase()
  const textLower = text.toLowerCase()

  // Simple fuzzy matching - check if query appears in text in order
  let queryIndex = 0
  for (let i = 0; i < textLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      queryIndex++
      if (queryIndex === queryLower.length) {
        return 1
      }
    }
  }

  return queryIndex / queryLower.length
}

// Levenshtein distance for fuzzy matching
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  const matrix: number[][] = []

  // Initialize the matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  // Fill in the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }

  return matrix[b.length][a.length]
}
