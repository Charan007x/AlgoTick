const KEYWORDS = new Set([
  "abstract", "assert", "boolean", "break", "byte", "case", "catch", "char",
  "class", "const", "continue", "default", "do", "double", "else", "enum",
  "extends", "final", "finally", "float", "for", "if", "implements", "import",
  "instanceof", "int", "interface", "long", "native", "new", "package",
  "private", "protected", "public", "return", "short", "static", "strictfp",
  "super", "switch", "synchronized", "this", "throw", "throws", "transient",
  "try", "void", "volatile", "while", "true", "false", "null",
]);

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function highlightJava(code) {
  if (!code) return "";

  const parts = code.split(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g);

  return parts
    .map((part) => {
      if (!part) return "";
      if (part.startsWith("//") || part.startsWith("/*")) {
        return `<span class="java-comment">${escapeHtml(part)}</span>`;
      }
      if (part.startsWith('"') || part.startsWith("'")) {
        return `<span class="java-string">${escapeHtml(part)}</span>`;
      }
      return escapeHtml(part).replace(
        /\b([A-Za-z_]\w*)\b/g,
        (word) =>
          KEYWORDS.has(word)
            ? `<span class="java-keyword">${word}</span>`
            : word,
      );
    })
    .join("");
}
