/**
 * Generate a short random ID for share slugs.
 *
 * Uses the CSPRNG, not Math.random: the slug is the only thing gating a
 * shared trip, so a predictable sequence would let anyone walk other
 * people's links. Rejection sampling keeps the alphabet uniform.
 */
export function nanoid(length = 10): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const limit = 256 - (256 % chars.length); // discard the biased tail
  let result = "";
  while (result.length < length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    for (const b of bytes) {
      if (b >= limit) continue;
      result += chars[b % chars.length];
      if (result.length === length) break;
    }
  }
  return result;
}
