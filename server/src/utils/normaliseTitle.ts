import { Role } from '../models/Role.model';

/**
 * Normalise a user-typed job title against the canonical roles collection.
 * Returns the canonical title if a match is found in aliases; otherwise returns the original input.
 */
export const normaliseTitle = async (rawTitle: string): Promise<string> => {
  const trimmed = rawTitle.trim();

  // 1. Exact match on canonical title (case-insensitive)
  const exactMatch = await Role.findOne({
    canonical: { $regex: new RegExp(`^${escapeRegex(trimmed)}$`, 'i') },
  });

  if (exactMatch) {
    return exactMatch.canonical;
  }

  // 2. Check aliases array (case-insensitive)
  const aliasMatch = await Role.findOne({
    aliases: { $regex: new RegExp(`^${escapeRegex(trimmed)}$`, 'i') },
  });

  if (aliasMatch) {
    return aliasMatch.canonical;
  }

  // 3. No match found — return original (will be stored as-is)
  return trimmed;
};

/**
 * Escape special regex characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
