/**
 * Helpers for building prettier JSON-Pointer-like paths using element IDs.
 *
 * Behavior:
 * - Walks the `data` object along `pathParts`.
 * - When the current value is an array and the next path part is an index,
 *   if the array element at that index has an `id` (string) the function uses
 *   that id in the output path instead of the numeric index.
 * - Otherwise the function uses the original part (string or numeric index).
 *
 * This implementation is explicit about types (uses `unknown` + type guards)
 * and is a little shorter and easier to follow than the original.
 */

export function prettifyPointerWithIds(
  data: unknown,
  pathParts: (string | number)[],
  // allow customizing which property names count as "id"
  idKeys: string[] = ["id"]
): string {
  const out: string[] = [];
  let cur: unknown = data;

  for (const part of pathParts) {
    // If we've already lost the value, just append the raw part
    if (cur === undefined || cur === null) {
      out.push(String(part));
      cur = undefined;
      continue;
    }

    // If current value is an array, try to use an element's id
    if (Array.isArray(cur)) {
      const idx = typeof part === "number" ? part : parseInt(String(part), 10);
      const elem: unknown = cur[idx];

      if (isRecord(elem)) {
        // look for first matching id key that is a non-empty string
        const foundId = idKeys
          .map((k) => elem[k])
          .find((v): v is string => typeof v === "string" && v.length > 0);

        if (foundId) {
          out.push(foundId);
        } else {
          out.push(String(part));
        }
      } else {
        out.push(String(part));
      }

      cur = elem;
      continue;
    }

    // If current value is a plain object, descend using the part as a property name
    if (isRecord(cur)) {
      out.push(String(part));
      cur = cur[String(part)];
      continue;
    }

    // scalar (number/string/etc) — can't descend
    out.push(String(part));
    cur = undefined;
  }

  return "/" + out.join("/");
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
