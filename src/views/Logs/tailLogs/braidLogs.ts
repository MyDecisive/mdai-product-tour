import type { LogRecord } from "../../../utils/types";

export function braidLogs(...logArrays: LogRecord[][]): LogRecord[] {
  const result: LogRecord[] = [];
  const indices = Array.from({ length: logArrays.length }, () => 0);

  // Calculate ratios based on array lengths for proportional distribution
  const lengths = logArrays.map((arr) => arr.length);
  const totalLength = lengths.reduce((sum, len) => sum + len, 0);
  const ratios = lengths.map((len) => len / totalLength);

  let position = 0;

  while (indices.some((idx, i) => idx < logArrays[i].length)) {
    // Find which array should contribute the next log based on ratios
    for (let i = 0; i < logArrays.length; i++) {
      const expectedCount = Math.floor(position * ratios[i]);
      const actualCount = indices[i];

      if (actualCount <= expectedCount && indices[i] < logArrays[i].length) {
        result.push(logArrays[i][indices[i]]);
        indices[i]++;
        position++;
        break;
      }
    }

    // Fallback: add from first available array if ratio logic doesn't advance
    if (result.length === position - 1) {
      for (let i = 0; i < logArrays.length; i++) {
        if (indices[i] < logArrays[i].length) {
          result.push(logArrays[i][indices[i]]);
          indices[i]++;
          position++;
          break;
        }
      }
    }
  }

  return result;
}
