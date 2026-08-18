/**
 * Splits a display name into firstName/lastName the same way the
 * `add_first_last_name_and_rename_show_whatsapp` migration backfilled
 * existing rows: everything before the first space is the first name,
 * everything after is the last name. When there is no space, the whole
 * value becomes the first name and the last name falls back to a single
 * space (" ").
 *
 * Shared by `User.create()`, `prisma/seed.ts`, and the e2e test fixtures —
 * import this instead of re-deriving the split elsewhere.
 */
export function splitName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const trimmed = fullName.trim();
  const spaceIndex = trimmed.indexOf(' ');
  if (spaceIndex === -1) {
    return { firstName: trimmed, lastName: ' ' };
  }
  return {
    firstName: trimmed.slice(0, spaceIndex),
    lastName: trimmed.slice(spaceIndex + 1),
  };
}
