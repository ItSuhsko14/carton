interface LayoutResult {
  lines: string[];
  fontSize: number;
  lineHeight: number;
}

const LINE_HEIGHT_RATIO = 1.15;
const MIN_FONT_SIZE = 8;

function wrapText(
  words: string[],
  fontSize: number,
  maxWidth: number,
  charWidthRatio: number,
): string[] | null {
  const charWidth = fontSize * charWidthRatio;
  const maxChars = Math.floor(maxWidth / charWidth);
  if (maxChars < 1) return null;

  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (word.length > maxChars) return null;
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Finds the largest font size at which the wrapped text fits inside the given box.
 */
export function layoutText(
  text: string,
  boxWidth: number,
  boxHeight: number,
  charWidthRatio: number,
): LayoutResult {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const upperBound = Math.floor(boxHeight);

  for (let fontSize = upperBound; fontSize >= MIN_FONT_SIZE; fontSize--) {
    const lines = wrapText(words, fontSize, boxWidth, charWidthRatio);
    if (!lines) continue;
    const lineHeight = fontSize * LINE_HEIGHT_RATIO;
    if (lines.length * lineHeight <= boxHeight) {
      return { lines, fontSize, lineHeight };
    }
  }

  const lines = wrapText(words, MIN_FONT_SIZE, boxWidth, charWidthRatio) ?? words;
  return { lines, fontSize: MIN_FONT_SIZE, lineHeight: MIN_FONT_SIZE * LINE_HEIGHT_RATIO };
}
