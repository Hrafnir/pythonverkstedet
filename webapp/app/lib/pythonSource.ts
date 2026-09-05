/** Preserve offsets/newlines while hiding comments and quoted text from diagnostics. */
export function pythonCodeOnly(source: string): string {
  let result = "", quote = "", triple = false, comment = false;
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (comment) { result += c === "\n" ? "\n" : " "; if (c === "\n") comment = false; continue; }
    if (quote) {
      if (c === "\\") { result += " "; if (i + 1 < source.length) result += source[++i] === "\n" ? "\n" : " "; continue; }
      if (c === quote && (!triple || source.slice(i, i + 3) === quote.repeat(3))) {
        result += triple ? "   " : " "; if (triple) i += 2; quote = ""; triple = false;
      } else result += c === "\n" ? "\n" : " ";
      continue;
    }
    if (c === "#") { comment = true; result += " "; }
    else if (c === '"' || c === "'") { quote = c; triple = source.slice(i, i + 3) === c.repeat(3); result += triple ? "   " : " "; if (triple) i += 2; }
    else result += c;
  }
  return result;
}
