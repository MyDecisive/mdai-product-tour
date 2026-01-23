#!/usr/bin/env ts-node

/**
 * CLI: validate-tour <tour-name | path/to/tour.yaml>
 *
 * - If the argument is a simple name (no path sep and no .yml/.yaml extension),
 *   the CLI will look for the file under ./src/assets/tours/<name>.yaml (then .yml).
 * - If you pass a path (contains / or ends with .yml/.yaml), it will use that path directly.
 *
 * Behavior:
 * - Validates the YAML against schema/tour-schema.json.
 * - Reports all validation errors with the YAML file position (file:line:col).
 * - The JSON path printed for errors tries to replace array indices with
 *   element "id" values when present. If no id is present the index/key is used.
 *
 */

import Ajv, { type JSONSchemaType } from "ajv";
import addFormats from "ajv-formats";
import fs from "fs";
import path from "path";
import process from "process";
import { isMap, isScalar, isSeq, type Node, Pair, parseDocument } from "yaml";
import type { Definition } from "../src/types/tour";

function usageAndExit(): never {
  console.error("Usage: validate-tour <tour-name | path/to/tour.yaml>");
  process.exit(2);
}

function buildLineIndex(text: string) {
  const lineStarts = [0];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\n") lineStarts.push(i + 1);
  }
  return lineStarts;
}

function offsetToLineCol(offset: number, lineStarts: number[]) {
  // returns 1-based line, 1-based column
  let low = 0;
  let high = lineStarts.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (lineStarts[mid] <= offset) low = mid + 1;
    else high = mid - 1;
  }
  const line = high; // 0-based index of line start
  const lineNumber = line + 1;
  const col = offset - lineStarts[line] + 1;
  return { line: lineNumber, col };
}

/**
 * Walk YAML AST using a JSON Pointer path (array form).
 * Returns the YAML node (value node) or undefined.
 */
function findYamlNodeByPath(
  rootNode: Node | null | undefined,
  pathParts: (string | number)[],
): Node | undefined {
  let node: Node | undefined = rootNode ?? undefined;
  if (!node) return undefined;

  for (const part of pathParts) {
    if (!node) return undefined;

    if (isMap(node)) {
      const map = node;
      const pair = map.items.find((p: Pair) => {
        try {
          const keyNode = p.key;
          if (isScalar(keyNode)) {
            const val = keyNode.value;
            return String(val) === String(part);
          } else {
            return String(keyNode) === String(part);
          }
        } catch {
          return false;
        }
      });
      if (!pair) return undefined;
      node = pair.value as Node | undefined;
    } else if (isSeq(node)) {
      const seq = node;
      const idx = typeof part === "number" ? part : parseInt(String(part), 10);
      node = seq.items[idx] as Node | undefined;
    } else {
      return undefined;
    }
  }

  return node;
}

function jsonPointerToPathParts(pointer: string) {
  // AJV instancePath is a JSON Pointer like '/steps/0/subSteps/1'
  if (!pointer) return [];
  return pointer
    .split("/")
    .slice(1)
    .map((part) => part.replace(/~1/g, "/").replace(/~0/g, "~"))
    .map((p) => {
      if (/^\d+$/.test(p)) return Number(p);
      return p;
    });
}

function reportYamlParseErrors(
  doc: unknown,
  filePath: string,
  out: Array<string>,
) {
  const maybeDoc = doc as { errors?: unknown[] } | undefined;
  if (
    maybeDoc?.errors &&
    Array.isArray(maybeDoc.errors) &&
    maybeDoc.errors.length
  ) {
    for (const err of maybeDoc.errors) {
      const message = (err as { message?: unknown })?.message ?? String(err);
      out.push(`${filePath}: YAML parse error: ${message as string}`);
    }
  }
}

/**
 * Resolve the argument into an actual file path:
 * - If the arg contains path separators or ends with .yml/.yaml, treat it as path.
 * - Otherwise, resolve to ./src/assets/tours/<name>.yaml (try .yaml then .yml).
 */
function resolveTourPathArg(arg: string) {
  const hasPathSep = arg.includes(path.sep) || arg.includes("/");
  const looksLikeYaml = arg.endsWith(".yaml") || arg.endsWith(".yml");

  if (hasPathSep || looksLikeYaml) {
    return path.resolve(process.cwd(), arg);
  }

  const base = path.resolve(process.cwd(), "src", "assets", "tours", arg);
  const yamlPath = base + ".yaml";
  const ymlPath = base + ".yml";
  if (fs.existsSync(yamlPath)) return yamlPath;
  if (fs.existsSync(ymlPath)) return ymlPath;
  // fallback: prefer .yaml path even if missing; let caller handle missing file error
  return yamlPath;
}

/**
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
  idKeys: string[] = ["id"],
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

function main() {
  try {
    const args = process.argv.slice(2);
    if (args.length === 0) usageAndExit();

    const arg = args[0];
    const filePath = resolveTourPathArg(arg);

    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(2);
    }

    const repoRoot = process.cwd();
    const schemaPath = path.resolve(repoRoot, "schema", "tour-schema.json");
    if (!fs.existsSync(schemaPath)) {
      console.error(`Schema not found at ${schemaPath}`);
      console.error(`Run: npm run generate-schema to create it.`);
      process.exit(2);
    }
    const schema = JSON.parse(
      fs.readFileSync(schemaPath, "utf8"),
    ) as JSONSchemaType<Definition>;

    const text = fs.readFileSync(filePath, "utf8");
    const lineStarts = buildLineIndex(text);

    const doc = parseDocument(text, { prettyErrors: true });

    // collect parse-time errors
    const reports: string[] = [];
    reportYamlParseErrors(doc, filePath, reports);

    // convert YAML doc to JS object for AJV
    let data: unknown;
    try {
      data = doc.toJS();
    } catch (err) {
      reports.push(`${filePath}: failed to convert YAML to JS: ${String(err)}`);
      console.error(reports.join("\n"));
      process.exit(2);
    }

    // validate with AJV
    const ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);

    const validate = ajv.compile(schema as object);
    const valid = validate(data as object);

    if (!valid && Array.isArray(validate.errors)) {
      for (const e of validate.errors) {
        const instancePath = (e.instancePath ||
          ((e as unknown) &&
            ((e as unknown as Record<string, unknown>)[
              "dataPath"
            ] as string)) ||
          "") as string;
        // For "required" errors AJV sets params.missingProperty; we append it to the pointer for reporting
        let pointer = instancePath;
        if (
          e.keyword === "required" &&
          e.params &&
          (e.params as Record<string, unknown>)["missingProperty"]
        ) {
          const missing = String(
            (e.params as Record<string, unknown>)["missingProperty"],
          );
          pointer =
            pointer +
            (pointer.endsWith("/") || pointer === "" ? "" : "/") +
            missing;
        }

        const pathParts = jsonPointerToPathParts(pointer);
        const node = findYamlNodeByPath(
          (doc as unknown as { contents?: Node }).contents,
          pathParts,
        );

        // fallback node: if not found, use parent (instancePath without appended missingProperty)
        let nodeForRange = node;
        if (!nodeForRange) {
          const parentParts = jsonPointerToPathParts(instancePath);
          nodeForRange = findYamlNodeByPath(
            (doc as unknown as { contents?: Node }).contents,
            parentParts,
          );
        }

        let positionStr = "";
        if (
          nodeForRange &&
          (nodeForRange as { range?: [number, number] }).range
        ) {
          const range = (nodeForRange as { range?: [number, number] })
            .range as [number, number];
          const startOffset = range[0];
          const { line, col } = offsetToLineCol(startOffset, lineStarts);
          positionStr = `${filePath}:${line}:${col}`;
        } else {
          // fallback: top of file
          positionStr = `${filePath}:1:1`;
        }

        const prettyPointer = prettifyPointerWithIds(
          data,
          jsonPointerToPathParts(pointer),
        );

        const message = e.message ? e.message : JSON.stringify(e);
        reports.push(
          `${positionStr} ${prettyPointer || "/"} — ${message} (keyword=${
            e.keyword
          })`,
        );
      }
    }

    if (reports.length > 0) {
      console.error("Validation errors found:");
      for (const r of reports) console.error(" - " + r);
      process.exit(2);
    } else {
      console.log("OK: no validation errors");
      process.exit(0);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    process.exit(2);
  }
}

main();
