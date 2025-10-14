import { describe, expect, it } from "vitest";
import { deepMergeWith } from "../deepMergeWith";

type TestType = {
  a: number;
  b: string;
  c?: {
    d: number;
    e?: {
      f: string;
    };
  };
  arr?: number[];
  meta?: { version: number };
};

describe("deepMergeWith", () => {
  it("should perform a default deep merge (no customizer)", () => {
    const target: TestType = { a: 1, b: "foo", c: { d: 2 } };
    const source = { c: { d: 3, e: { f: "deep" } } };
    const result = deepMergeWith(target, source);

    expect(result).toEqual({
      a: 1,
      b: "foo",
      c: {
        d: 3,
        e: { f: "deep" },
      },
    });
  });

  it("should use customizer to append arrays", () => {
    const target = { arr: [1, 2], a: 1 };
    const source = { arr: [3], a: 2 };
    const customizer = (targetVal: unknown, sourceVal: unknown) => {
      if (Array.isArray(targetVal) && Array.isArray(sourceVal)) {
        return [...(targetVal as unknown[]), ...(sourceVal as unknown[])];
      }
      return undefined; // fallback to default
    };
    const result = deepMergeWith(target, source, customizer);

    expect(result.arr).toEqual([1, 2, 3]);
    expect(result.a).toBe(2);
  });

  it("should use customizer to always prefer source values", () => {
    const target = { a: 1, b: "foo", c: { d: 2 } };
    const source = { a: 2, b: "bar", c: { d: 3 } };
    const customizer = (_: unknown, sourceVal: unknown) => sourceVal;
    const result = deepMergeWith(target, source, customizer);

    expect(result).toEqual({ a: 2, b: "bar", c: { d: 3 } });
  });

  it("should use customizer to skip merging a certain key", () => {
    const target = { a: 1, meta: { version: 1 } };
    const source = { a: 2, meta: { version: 2 } };
    const customizer = (targetVal: unknown, _: unknown, key: string) => {
      if (key === "meta") return targetVal; // never merge meta
      return undefined;
    };
    const result = deepMergeWith(target, source, customizer);

    expect(result).toEqual({ a: 2, meta: { version: 1 } });
  });

  it("should not mutate target or source", () => {
    const target = { a: 1, arr: [1, 2] };
    const source = { arr: [3] };
    const targetCopy = JSON.parse(JSON.stringify(target)) as typeof target;
    const sourceCopy = JSON.parse(JSON.stringify(source)) as typeof source;

    deepMergeWith(target, source);

    expect(target).toEqual(targetCopy);
    expect(source).toEqual(sourceCopy);
  });

  it("should handle undefined in source (default behavior)", () => {
    const target = { a: 1, b: "foo" };
    const source = { a: undefined };
    const result = deepMergeWith(target, source);

    expect(result).toEqual({ a: 1, b: "foo" });
  });

  it("should merge deeply with partial and undefined keys (default behavior)", () => {
    const target: TestType = {
      a: 1,
      b: "foo",
      c: { d: 2, e: { f: "bar" } },
    };
    const source = {
      c: { e: { f: "baz" } },
    };
    const result = deepMergeWith(target, source);

    expect(result).toEqual({
      a: 1,
      b: "foo",
      c: { d: 2, e: { f: "baz" } },
    });
  });
});
