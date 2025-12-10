import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CURSOR_CHAR, TERMINAL_PROMPT } from "../constants";
import type { ActivePod, ActivePodMap } from "../engineTypesScratch";
import {
  braidLogs,
  createLogRecord,
  createTerminalContent,
  findReplacementPod,
  parseRawLogFileToLogLines,
} from "../transformHelpers";
import type { LogRecord } from "../types";

describe("createLogRecord", () => {
  const mockDate = new Date("2024-01-15T12:00:00.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should create a log record with timestamp and id", () => {
    const propLog: LogRecord = {
      message: "Test log message",
      level: "info",
    };

    const result = createLogRecord(propLog, 1, 0);

    expect(result).toEqual({
      message: "Test log message",
      level: "info",
      timestamp: "2024-01-15T12:00:00.000Z",
      id: "log-1-0",
    });
  });

  it("should preserve all properties from propLog", () => {
    const propLog: LogRecord = {
      message: "Test message",
      content: "Test content",
      level: "debug",
      customField: "custom value",
    };

    const result = createLogRecord(propLog, 2, 5);

    expect(result.message).toBe("Test message");
    expect(result.content).toBe("Test content");
    expect(result.level).toBe("debug");
    expect(result.customField).toBe("custom value");
  });

  it("should create error log with error id format", () => {
    const propLog: LogRecord = {
      message: "Error message",
      level: "error",
    };

    const result = createLogRecord(propLog, 1, 0, true);

    expect(result.timestamp).toBe("2024-01-15T12:00:00.000Z");
    expect(result.id).toMatch(/^error-\d+-0\.\d+$/);
  });

  it("should create unique error ids", () => {
    const propLog: LogRecord = { message: "Error" };

    const result1 = createLogRecord(propLog, 1, 0, true);
    const result2 = createLogRecord(propLog, 1, 0, true);

    expect(result1.id).not.toBe(result2.id);
  });

  it("should create different ids for different cycle counts", () => {
    const propLog: LogRecord = { message: "Test" };

    const result1 = createLogRecord(propLog, 1, 0);
    const result2 = createLogRecord(propLog, 2, 0);

    expect(result1.id).toBe("log-1-0");
    expect(result2.id).toBe("log-2-0");
  });

  it("should create different ids for different indices", () => {
    const propLog: LogRecord = { message: "Test" };

    const result1 = createLogRecord(propLog, 1, 0);
    const result2 = createLogRecord(propLog, 1, 5);

    expect(result1.id).toBe("log-1-0");
    expect(result2.id).toBe("log-1-5");
  });

  it("should handle empty propLog object", () => {
    const propLog: LogRecord = {};

    const result = createLogRecord(propLog, 1, 0);

    expect(result.timestamp).toBe("2024-01-15T12:00:00.000Z");
    expect(result.id).toBe("log-1-0");
    expect(Object.keys(result)).toContain("timestamp");
    expect(Object.keys(result)).toContain("id");
  });

  it("should override existing timestamp and id from propLog", () => {
    const propLog: LogRecord = {
      message: "Test",
      timestamp: "2020-01-01T00:00:00.000Z",
      id: "old-id",
    };

    const result = createLogRecord(propLog, 1, 0);

    expect(result.timestamp).toBe("2024-01-15T12:00:00.000Z");
    expect(result.id).toBe("log-1-0");
  });

  it("should handle undefined isError parameter (default to false)", () => {
    const propLog: LogRecord = { message: "Test" };

    const result = createLogRecord(propLog, 1, 0, undefined);

    expect(result.id).toBe("log-1-0");
  });

  it("should handle false isError parameter", () => {
    const propLog: LogRecord = { message: "Test" };

    const result = createLogRecord(propLog, 1, 0, false);

    expect(result.id).toBe("log-1-0");
  });
});

describe("parseRawLogFileToLogLines", () => {
  it("should parse service logs format", () => {
    const rawLogs = `
mdai-logger-xnoisy 2025-11-26T19:25:40+00:00 - service4321 - teamB - us-east-1 - INFO - The algorithm successfully executed, triggering neural pathways and producing a burst of optimized data streams.
mdai-logger-xnoisy 2025-11-26T19:25:40+00:00 - service4321 - teamB - us-east-1 - INFO - The algorithm successfully executed, triggering neural pathways and producing a burst of optimized data streams.
mdai-logger 2025-11-26T19:25:40+00:00 - service34 - teamR - us-east-1 - WARNING - The algorithm successfully executed, triggering neural pathways and producing a burst of optimized data streams.
mdai-logger-noisy 2025-11-26T19:25:40+00:00 - service1234 - teamA - us-east-1 - ERROR - The algorithm successfully executed, triggering neural pathways and producing a burst of optimized data streams.
    `.trim();

    const result = parseRawLogFileToLogLines(rawLogs);

    expect(result).toHaveLength(4);
    expect(result[0]).toMatchObject({
      level: "INFO",
      message: expect.stringContaining(
        "service4321 - The algorithm"
      ) as unknown,
    });
    expect(result[2]).toMatchObject({
      level: "WARNING",
      message: expect.stringContaining("service34 - The algorithm") as unknown,
    });
  });
  it("should parse kubernetesLogs logs format", () => {
    const rawLogs = `
2025-11-26 18:22:10.938554625 +0000 kubernetes.var.log.containers.mdai-logger-bundle-8584566955-45flc_synthetics_mdai-logger-noisy-4d4a707f61ba80f5cdff756f7770c9c179464456c54e1c9f3777806e23fec8cf.log: {"timestamp":"2025-11-26T18:22:10+00:00","mdai_service":"service1234","team":"teamA","region":"us-east-1","level":"INFO","message":"The algorithm successfully executed, triggering neural pathways and producing a burst of optimized data streams."}
2025-11-26 18:22:10.938559625 +0000 kubernetes.var.log.containers.mdai-logger-bundle-8584566955-45flc_synthetics_mdai-logger-noisy-4d4a707f61ba80f5cdff756f7770c9c179464456c54e1c9f3777806e23fec8cf.log: {"timestamp":"2025-11-26T18:22:10+00:00","mdai_service":"service1234","team":"teamA","region":"us-east-1","level":"WARNING","message":"The algorithm successfully executed, triggering neural pathways and producing a burst of optimized data streams."}
2025-11-26 18:22:11.110704250 +0000 kubernetes.var.log.containers.mdai-logger-bundle-8584566955-45flc_synthetics_mdai-logger-xnoisy-6e97f1ed771fc785d1cabfaa575ecc5a9c5393b87bb21faff4312d16bb6f8efd.log: {"timestamp":"2025-11-26T18:22:10+00:00","mdai_service":"service4321","team":"teamB","region":"us-east-1","level":"INFO","message":"The algorithm successfully executed, triggering neural pathways and producing a burst of optimized data streams."}
    `.trim();

    const result = parseRawLogFileToLogLines(rawLogs);

    expect(result).toHaveLength(3);
    expect(result[1]).toMatchObject({
      level: "WARNING",
      message: expect.stringContaining(
        "flc_synthetics_mdai-logger-noisy-4d4a707f61"
      ) as unknown,
    });
    expect(result[2]).toMatchObject({
      level: "INFO",
      message: expect.stringContaining(
        "flc_synthetics_mdai-logger-xnoisy-6e97f1ed"
      ) as unknown,
    });
  });
  it("should parse collectorLogs logs format", () => {
    const rawLogs = `
2025-12-01T22:47:26.730Z    info    extensions/extensions.go:62    Extension started.    {"resource": {"mdai-logstream": "collector"}, "otelcol.component.id": "health_check", "otelcol.component.kind": "extension"}
2025-12-01T22:47:26.730Z    info    healthcheck/handler.go:132    Health Check state change    {"resource": {"mdai-logstream": "collector"}, "otelcol.component.id": "health_check", "otelcol.component.kind": "extension", "status": "ready"}
2025-12-01T22:47:26.730Z    info    service@v0.127.0/service.go:289    Everything is ready. Begin running and processing data.    {"resource": {"mdai-logstream": "collector"}}
2025-12-01T22:47:39.731Z    info    Logs    {"resource": {"mdai-logstream": "collector"}, "otelcol.component.id": "debug/filtered", "otelcol.component.kind": "exporter", "otelcol.signal": "logs", "resource logs": 7, "log records": 871}
    `.trim();

    const result = parseRawLogFileToLogLines(rawLogs);

    expect(result).toHaveLength(4);
    expect(result[1]).toMatchObject({
      level: "INFO",
      message: expect.stringContaining(
        "healthcheck/handler.go:132 Health Check state change"
      ) as unknown,
    });
    expect(result[3]).toMatchObject({
      level: "INFO",
      message: expect.stringContaining(
        `Logs {"resource": {"mdai-logstream": "collector"}`
      ) as unknown,
    });
  });
  it("should parse error logs format", () => {
    const rawLogs = `
2025-10-23T14:12:45.219Z    error    api@v0.118.0/client.go:87    Failed to connect to external API    {"endpoint": "https://dev.api.local/v1/data", "retryCount": 3}
2025-10-23T14:12:50.782Z    error    db@v0.118.0/connection.go:203    Database query timeout after 30s    {"query": "SELECT * FROM users WHERE active = true", "duration": "30s"}
2025-10-23T14:13:02.144Z    error    server@v0.118.0/handler.go:56    Invalid JSON in request body    {"route": "/api/upload", "client": "192.168.1.45"}
2025-10-23T14:13:17.921Z    warn    gateway@v0.118.0/middleware.go:134    Rate limit exceeded for client    {"client": "192.168.1.100", "limit": "100 req/min"}
2025-10-23T14:13:25.512Z    error    telemetry@v0.118.0/exporter.go:62    Failed to send telemetry data    {"destination": "collector.dev:4317", "reason": "connection refused"}
    `.trim();

    const result = parseRawLogFileToLogLines(rawLogs);

    expect(result).toHaveLength(5);
    expect(result[0]).toMatchObject({
      level: "ERROR",
      message: expect.stringContaining(
        "api@v0.118.0/client.go:87: Failed to connect"
      ) as unknown,
    });
    expect(result[3]).toMatchObject({
      level: "WARN",
      message: expect.stringContaining(
        `gateway@v0.118.0/middleware.go:134: Rate limit exceeded`
      ) as unknown,
    });
  });
});

function makeRecords(prefix: string, ids: string[]): LogRecord[] {
  return ids.map((id) => ({ id: `${prefix}${id}` }));
}

describe("braidLogs", () => {
  it("braids two arrays proportionally and preserves per-source order", () => {
    const a = makeRecords("a", ["1", "2", "3"]); // a1,a2,a3
    const b = makeRecords("b", ["1", "2"]); // b1,b2

    const result = braidLogs(a, b);
    const ids = result.map((r) => r.id);

    // Expected interleaving based on the algorithm: a1,b1,a2,b2,a3
    expect(ids).toEqual(["a1", "b1", "a2", "b2", "a3"]);

    // Ensure each source's internal order is preserved
    const aSeen = ids.filter((id) => id?.startsWith("a"));
    const bSeen = ids.filter((id) => id?.startsWith("b"));
    expect(aSeen).toEqual(["a1", "a2", "a3"]);
    expect(bSeen).toEqual(["b1", "b2"]);
  });

  it("braids three arrays and preserves per-source order", () => {
    const a = makeRecords("a", ["1", "2", "3"]); // a1,a2,a3
    const b = makeRecords("b", ["1"]); // b1
    const c = makeRecords("c", ["1"]); // c1

    const result = braidLogs(a, b, c);
    const ids = result.map((r) => r.id);

    // Expected interleaving (per algorithm simulation): a1,b1,a2,c1,a3
    expect(ids).toEqual(["a1", "b1", "a2", "c1", "a3"]);

    // Verify per-source order is preserved
    expect(ids.filter((id) => id?.startsWith("a"))).toEqual(["a1", "a2", "a3"]);
    expect(ids.filter((id) => id?.startsWith("b"))).toEqual(["b1"]);
    expect(ids.filter((id) => id?.startsWith("c"))).toEqual(["c1"]);

    expect(result).toHaveLength(a.length + b.length + c.length);
  });

  it("handles empty input arrays (one empty, one non-empty)", () => {
    const empty: LogRecord[] = [];
    const b = makeRecords("b", ["1", "2"]);

    const result = braidLogs(empty, b);
    expect(result.map((r) => r.id)).toEqual(["b1", "b2"]);
    expect(result).toHaveLength(2);
  });
});

describe("createTerminalContent", () => {
  describe("user entry behavior (default)", () => {
    it("should create user entry content with single string", () => {
      const result = createTerminalContent(["ls -la"], false);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        printed: false,
        typeSpeed: 70,
        backSpeed: 150,
        cursorChar: CURSOR_CHAR,
        showCursor: true,
        contentType: "html",
        prompt: TERMINAL_PROMPT,
      });
      expect(result[0].strings).toEqual([`\`${TERMINAL_PROMPT}\` ^850ls -la`]);
    });

    it("should create user entry content with multiple strings", () => {
      const strings = ["cd /var/log", "tail -f syslog", "exit"];
      const result = createTerminalContent(strings, true);

      expect(result).toHaveLength(1);
      expect(result[0].printed).toBe(true);
      expect(result[0].strings).toEqual([
        `\`${TERMINAL_PROMPT}\` ^850cd /var/log`,
        `\`${TERMINAL_PROMPT}\` ^850tail -f syslog`,
        `\`${TERMINAL_PROMPT}\` ^850exit`,
      ]);
    });

    it("should handle empty strings array", () => {
      const result = createTerminalContent([], false);

      expect(result).toHaveLength(1);
      expect(result[0].strings).toEqual([]);
    });

    it("should preserve printed flag", () => {
      const resultFalse = createTerminalContent(["test"], false);
      const resultTrue = createTerminalContent(["test"], true);

      expect(resultFalse[0].printed).toBe(false);
      expect(resultTrue[0].printed).toBe(true);
    });

    it("should format strings with prompt and delay", () => {
      const result = createTerminalContent(['echo "hello"'], false);

      expect(result[0].strings?.[0]).toMatch(/^`.*` \^850echo "hello"$/);
    });
  });

  describe("terminal execution behavior", () => {
    it("should create terminal execution content with single string", () => {
      const result = createTerminalContent(["Loading..."], false, "terminal");

      expect(result).toHaveLength(2);

      expect(result[0]).toMatchObject({
        printed: false,
        startDelay: 500,
        typeSpeed: 5,
        cursorChar: CURSOR_CHAR,
        showCursor: true,
        contentType: "html",
        strings: ["\n"],
      });

      expect(result[1]).toMatchObject({
        printed: false,
        startDelay: 500,
        typeSpeed: 5,
        strings: ["Loading..."],
      });
    });

    it("should create terminal execution content with multiple strings", () => {
      const strings = ["Line 1", "Line 2", "Line 3"];
      const result = createTerminalContent(strings, true, "terminal");

      expect(result).toHaveLength(4);

      expect(result[0].strings).toEqual(["\n"]);
      expect(result[0].printed).toBe(true);

      strings.forEach((str, index) => {
        expect(result[index + 1]).toMatchObject({
          printed: true,
          strings: [str],
          startDelay: 500,
          typeSpeed: 5,
        });
      });
    });

    it("should handle empty strings array with terminal behavior", () => {
      const result = createTerminalContent([], false, "terminal");

      expect(result).toHaveLength(1);
      expect(result[0].strings).toEqual(["\n"]);
    });

    it("should not include prompt in terminal execution", () => {
      const result = createTerminalContent(["test"], false, "terminal");

      result.forEach((entry) => {
        expect(entry.prompt).toBeUndefined();
      });
    });

    it("should preserve printed flag in terminal behavior", () => {
      const resultFalse = createTerminalContent(["test"], false, "terminal");
      const resultTrue = createTerminalContent(["test"], true, "terminal");

      resultFalse.forEach((entry) => {
        expect(entry.printed).toBe(false);
      });

      resultTrue.forEach((entry) => {
        expect(entry.printed).toBe(true);
      });
    });
  });

  describe("behavior parameter edge cases", () => {
    it("should default to user entry behavior when behavior is undefined", () => {
      const result = createTerminalContent(["test"], false, undefined);

      expect(result).toHaveLength(1);
      expect(result[0].prompt).toBe(TERMINAL_PROMPT);
      expect(result[0].typeSpeed).toBe(70);
    });

    it("should default to user entry behavior for unknown behavior string", () => {
      const result = createTerminalContent(["test"], false, "unknown");

      expect(result).toHaveLength(1);
      expect(result[0].prompt).toBe(TERMINAL_PROMPT);
      expect(result[0].typeSpeed).toBe(70);
    });
  });

  describe("return type structure", () => {
    it("should return array of TerminalTypedOptions", () => {
      const result = createTerminalContent(["test"], false);

      expect(Array.isArray(result)).toBe(true);
      result.forEach((entry) => {
        expect(entry).toHaveProperty("printed");
        expect(entry).toHaveProperty("strings");
        expect(entry).toHaveProperty("cursorChar");
        expect(entry).toHaveProperty("showCursor");
        expect(entry).toHaveProperty("contentType");
      });
    });
  });

  describe("string formatting", () => {
    it("should handle strings with special characters", () => {
      const strings = ['echo "test"', "ls -la | grep file", "cat file.txt"];
      const result = createTerminalContent(strings, false);

      expect(result[0].strings).toHaveLength(3);
      strings.forEach((str, index) => {
        expect(result[0].strings?.[index]).toContain(str);
      });
    });

    it("should handle empty strings in array", () => {
      const strings = ["", "test", ""];
      const result = createTerminalContent(strings, false);

      expect(result[0].strings).toHaveLength(3);
      expect(result[0].strings?.[0]).toMatch(/^`.*` \^850$/);
      expect(result[0].strings?.[1]).toContain("test");
    });

    it("should handle strings with newlines in user entry mode", () => {
      const strings = ['echo "line1\nline2"'];
      const result = createTerminalContent(strings, false);

      expect(result[0].strings?.[0]).toContain("line1\nline2");
    });
  });
});

describe("findReplacementPod", () => {
  const createPod = (overrides: Partial<ActivePod>): ActivePod => ({
    id: "pod-1",
    name: "auth-service-abc123",
    namespace: "production",
    status: "Running",
    replicaNo: 1,
    parentServiceKey: "service-key-1",
    restartCount: 0,
    ...overrides,
  });

  describe("successful replacement scenarios", () => {
    it("should find replacement pod with different parentServiceKey but same service and namespace", () => {
      const currentPod = createPod({
        id: "pod-1",
        name: "auth-service-abc123",
        parentServiceKey: "service-key-1",
        namespace: "production",
      });

      const activePods: ActivePodMap = {
        "pod-2": createPod({
          id: "pod-2",
          name: "auth-service-xyz789",
          parentServiceKey: "service-key-2", // Different parent
          namespace: "production",
          status: "Running",
        }),
      };

      const result = findReplacementPod(currentPod, activePods);

      expect(result).toBeDefined();
      expect(result?.id).toBe("pod-2");
      expect(result?.parentServiceKey).not.toBe(currentPod.parentServiceKey);
    });

    it("should prefer the first matching pod when multiple replacements exist", () => {
      const currentPod = createPod({
        id: "pod-1",
        name: "auth-service-abc123",
        parentServiceKey: "service-key-1",
      });

      const activePods: ActivePodMap = {
        "pod-2": createPod({
          id: "pod-2",
          name: "auth-service-xyz789",
          parentServiceKey: "service-key-2",
          status: "Running",
        }),
        "pod-3": createPod({
          id: "pod-3",
          name: "auth-service-def456",
          parentServiceKey: "service-key-3",
          status: "Running",
        }),
      };

      const result = findReplacementPod(currentPod, activePods);

      expect(result).toBeDefined();
      // based on Object.values order
      expect(["pod-2", "pod-3"]).toContain(result?.id);
    });
  });

  describe("rejection scenarios - no match found", () => {
    it("should return undefined when pod has same parentServiceKey", () => {
      const currentPod = createPod({
        parentServiceKey: "service-key-1",
      });

      const activePods: ActivePodMap = {
        "pod-2": createPod({
          parentServiceKey: "service-key-1",
          status: "Running",
        }),
      };

      const result = findReplacementPod(currentPod, activePods);

      expect(result).toBeUndefined();
    });

    it("should return undefined when pod is in different namespace", () => {
      const currentPod = createPod({
        namespace: "production",
        parentServiceKey: "service-key-1",
      });

      const activePods: ActivePodMap = {
        "pod-2": createPod({
          namespace: "staging",
          parentServiceKey: "service-key-2",
          status: "Running",
        }),
      };

      const result = findReplacementPod(currentPod, activePods);

      expect(result).toBeUndefined();
    });

    it("should return undefined when pod is from different service", () => {
      const currentPod = createPod({
        name: "auth-service-abc123",
        parentServiceKey: "service-key-1",
      });

      const activePods: ActivePodMap = {
        "pod-2": createPod({
          name: "billing-service-xyz789",
          parentServiceKey: "service-key-2",
          status: "Running",
        }),
      };

      const result = findReplacementPod(currentPod, activePods);

      expect(result).toBeUndefined();
    });

    it("should return undefined when pod is not running", () => {
      const currentPod = createPod({
        parentServiceKey: "service-key-1",
      });

      const activePods: ActivePodMap = {
        "pod-2": createPod({
          parentServiceKey: "service-key-2",
          status: "Pending",
        }),
      };

      const result = findReplacementPod(currentPod, activePods);

      expect(result).toBeUndefined();
    });

    it("should return undefined when activePods is empty", () => {
      const currentPod = createPod({});
      const activePods: ActivePodMap = {};

      const result = findReplacementPod(currentPod, activePods);

      expect(result).toBeUndefined();
    });
  });
});
