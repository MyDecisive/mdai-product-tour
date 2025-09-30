import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGetConfigSimulatorContent } from "../useGetConfigSimulatorContent";

// Mock dependencies
vi.mock("../useHighlander", () => ({
  useHighlander: vi.fn(() => ({
    state: {
      navigation: { view: "test" },
      animationIndex: 0,
    },
    actions: {
      INCREMENT_ANIMATION: vi.fn(),
    },
  })),
}));

vi.mock("../useSelector", () => ({
  useSelector: vi.fn(),
}));

// Mock the selector - adjust the path to match your actual import
vi.mock("../../contexts/selectors", () => ({
  selectPanelState: vi.fn(),
}));

// Mock requestAnimationFrame for smooth scrolling tests
global.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
  setTimeout(cb, 0);
  return 1;
});

// Import the mocked functions after the mocks are set up
import { selectPanelState } from "../../contexts/selectors";
import { useSelector } from "../useSelector";

const mockUseSelector = vi.mocked(useSelector);
const mockSelectPanelState = vi.mocked(selectPanelState);

describe("useGetConfigSimulatorContent", () => {
  const mockConfig = {
    files: {
      ["otel_ref.yaml"]: {
        text: `apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  labels:
    mdaihub-name: mdaihub-sample
  name: gateway
  namespace: mdai
spec:
  managementState: managed
  image: otel/opentelemetry-collector-contrib:0.118.0
  replicas: 1
  resources:
    limits:
      memory: "256Mi"
      cpu: "200m"
    requests:
      memory: "128Mi"
      cpu: "100m"
  envFrom:
    - configMapRef:
        name: mdaihub-sample-variables
  config:
    receivers:
      fluentforward:
        endpoint: "\${env:MY_POD_IP}:8006"
      otlp:
        protocols:
          grpc:
            endpoint: "\${env:MY_POD_IP}:4317"
          http:
            endpoint: "\${env:MY_POD_IP}:4318"
            # Since this collector needs to receive data from the web, enable cors for all origins
            # \`allowed_origins\` can be refined for your deployment domain
            cors:
              allowed_origins:
                - "http://*"
                - "https://*"

    extensions:
      # The health_check extension is mandatory for this chart.
      # Without the health_check extension the collector will fail the readiness and liveliness probes.
      # The health_check extension can be modified, but should never be removed.
      health_check:
        endpoint: "\${env:MY_POD_IP}:13133"

    processors:
      memory_limiter:
        check_interval: 23s
        limit_percentage: 75
        spike_limit_percentage: 15

      batch:
        send_batch_size: 1000
        send_batch_max_size: 10000
        timeout: 13s

      groupbyattrs:
        keys:
          - mdai_service

      resource/observer_receiver_tag:
        attributes:
          - key: observer_direction
            value: "received"
            action: upsert

      resource/observer_exporter_tag:
        attributes:
          - key: observer_direction
            value: "exported"
            action: upsert

      # FILTER PROCESSOR ADDED
      filter/static_filter:
        error_mode: ignore
        logs:
          log_record:
            - 'IsMatch(attributes["mdai_service"], "service4321")'

    exporters:
      debug: {}
      otlp/observer:
        endpoint: mdaihub-sample-observer-collector-service.mdai.svc.cluster.local:4317
        tls:
          insecure: true

    service:
      telemetry:
        resource:
          mdai-logstream: collector
        metrics:
          address: ":8888"
      extensions:
        - health_check
      pipelines:
        logs/customer_pipeline:
          receivers: [otlp, fluentforward]
          processors: [
              # FILTRATION IS RUNNING
              filter/static_filter,
              # DO NOT CHANGE ORDER
              resource/observer_exporter_tag,
              groupbyattrs,
              memory_limiter,
              # DO NOT CHANGE ORDER
              # batch must be last in processor list
              batch,
            ]
          exporters: [debug, otlp/observer]

        logs/watch_receivers:
          receivers: [otlp, fluentforward]
          processors: [
              resource/observer_receiver_tag,
              groupbyattrs,
              memory_limiter,
              # DO NOT CHANGE ORDER
              # batch must be last in processor list
              batch,
            ]
          exporters: [debug, otlp/observer]`,
        title: "otel_ref.yaml",
        changes: [
          {
            start: 73,
            end: 78,
            oldValues: [
              "      # UNCOMMENT THE FOLLOWING LINE TO ADD FILTER PROCESSOR",
              "      # filter/static_filter:",
              "      #   error_mode: ignore",
              "      #   logs:",
              "      #     log_record:",
              '      #       - \'IsMatch(attributes["mdai_service"], "service4321")\'',
            ],
          },
          {
            start: 99,
            end: 100,
            oldValues: [
              "              # UNCOMMENT THE FOLLOWING LINE TO START FILTRATION",
              "              # filter/static_filter",
            ],
          },
        ],
        initialLineToggles: {
          100: true,
          99: true,
        },
        showToggleButtons: false,
      },
    },
  };

  const mockPanelState = {
    isShowingPreviousContent: false,
    animations: [],
    config: mockConfig,
    terminal: null,
    status: null,
    logs: null,
    banner: null,
  };

  beforeEach(() => {
    mockUseSelector.mockReturnValue(mockPanelState);
    mockSelectPanelState.mockReturnValue(mockPanelState);
    // vi.clearAllMocks(); // Temporarily disabled to see if this affects state
  });

  describe("basic functionality", () => {
    it("should return the correct title", () => {
      const { result } = renderHook(() => useGetConfigSimulatorContent());
      expect(result.current.tabContents[0].title).toBe("otel_ref.yaml");
    });

    it("should return showToggleButtons value", () => {
      const { result } = renderHook(() => useGetConfigSimulatorContent());
      expect(result.current.tabContents[0].showToggleButtons).toBe(false);
    });

    it("should return containerRef", () => {
      const { result } = renderHook(() => useGetConfigSimulatorContent());
      expect(result.current.tabContents[0].containerRef).toBeDefined();
      expect(result.current.tabContents[0].containerRef.current).toBeNull();
    });

    it("should return toggleLineValue function", () => {
      const { result } = renderHook(() => useGetConfigSimulatorContent());
      expect(typeof result.current.tabContents[0].toggleLineValue).toBe(
        "function"
      );
    });
  });

  describe("textGroups generation", () => {
    it("should generate the correct number of textGroups", () => {
      const { result } = renderHook(() => useGetConfigSimulatorContent());
      expect(result.current.tabContents[0].textGroups).toHaveLength(13);
    });

    it("should correctly identify change blocks", () => {
      const { result } = renderHook(() => useGetConfigSimulatorContent());
      const changeBlocks = result.current.tabContents[0].textGroups.filter(
        (group) => group.isChangeBlock
      );
      expect(changeBlocks).toHaveLength(2);
    });

    it("should correctly identify gap sections", () => {
      const { result } = renderHook(() => useGetConfigSimulatorContent());
      const gapBlocks = result.current.tabContents[0].textGroups.filter(
        (group) => group.isGap
      );
      expect(gapBlocks).toHaveLength(5);
    });

    it("should match expected structure for first change block", () => {
      const { result } = renderHook(() => useGetConfigSimulatorContent());
      const firstChangeBlock = result.current.tabContents[0].textGroups.find(
        (group) => group.isChangeBlock
      );

      expect(firstChangeBlock).toEqual({
        lines: [
          {
            lineNo: 73,
            content:
              "      # UNCOMMENT THE FOLLOWING LINE TO ADD FILTER PROCESSOR",
            isHighlighted: true,
            newValue: "      # FILTER PROCESSOR ADDED",
            showingNewValue: false,
            isGap: false,
          },
          {
            lineNo: 74,
            content: "      # filter/static_filter:",
            isHighlighted: true,
            newValue: "      filter/static_filter:",
            showingNewValue: false,
            isGap: false,
          },
          {
            lineNo: 75,
            content: "      #   error_mode: ignore",
            isHighlighted: true,
            newValue: "        error_mode: ignore",
            showingNewValue: false,
            isGap: false,
          },
          {
            lineNo: 76,
            content: "      #   logs:",
            isHighlighted: true,
            newValue: "        logs:",
            showingNewValue: false,
            isGap: false,
          },
          {
            lineNo: 77,
            content: "      #     log_record:",
            isHighlighted: true,
            newValue: "          log_record:",
            showingNewValue: false,
            isGap: false,
          },
          {
            lineNo: 78,
            content:
              '      #       - \'IsMatch(attributes["mdai_service"], "service4321")\'',
            isHighlighted: true,
            newValue:
              '            - \'IsMatch(attributes["mdai_service"], "service4321")\'',
            showingNewValue: false,
            isGap: false,
          },
        ],
        startLineNo: 73,
        endLineNo: 78,
        isChangeBlock: true,
        isGap: false,
        sectionIndex: 6,
        groupIndex: 0,
      });
    });

    it("should match expected structure for second change block", () => {
      const { result } = renderHook(() => useGetConfigSimulatorContent());
      const changeBlocks = result.current.tabContents[0].textGroups.filter(
        (group) => group.isChangeBlock
      );
      const secondChangeBlock = changeBlocks[1];

      expect(secondChangeBlock).toEqual({
        lines: [
          {
            lineNo: 99,
            content:
              "              # UNCOMMENT THE FOLLOWING LINE TO START FILTRATION",
            isHighlighted: true,
            newValue: "              # FILTRATION IS RUNNING",
            showingNewValue: true,
            isGap: false,
          },
          {
            lineNo: 100,
            content: "              # filter/static_filter",
            isHighlighted: true,
            newValue: "              filter/static_filter,",
            showingNewValue: true,
            isGap: false,
          },
        ],
        startLineNo: 99,
        endLineNo: 100,
        isChangeBlock: true,
        isGap: false,
        sectionIndex: 10,
        groupIndex: 1,
      });
    });
  });

  describe("line toggling functionality", () => {
    it("should toggle line values correctly", () => {
      const { result } = renderHook(() => useGetConfigSimulatorContent());

      act(() => {
        result.current.tabContents[0].toggleLineValue([73, 74]);
      });

      expect(result.current.tabContents[0].pulsedLines.has(73)).toBe(true);
      expect(result.current.tabContents[0].pulsedLines.has(74)).toBe(true);
    });

    it("should clear pulsed lines after timeout", async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useGetConfigSimulatorContent());

      act(() => {
        result.current.tabContents[0].toggleLineValue([73]);
      });

      expect(result.current.tabContents[0].pulsedLines.has(73)).toBe(true);

      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(result.current.tabContents[0].pulsedLines.has(73)).toBe(false);

      vi.useRealTimers();
    });

    it("should update showingNewValue when lines are toggled", () => {
      const { result } = renderHook(() => useGetConfigSimulatorContent());

      act(() => {
        result.current.tabContents[0].toggleLineValue([73]);
      });

      const changeBlock = result.current.tabContents[0].textGroups.find(
        (group) => group.isChangeBlock
      );
      const toggledLine = changeBlock?.lines.find((line) => line.lineNo === 73);

      expect(toggledLine?.showingNewValue).toBe(true);
    });
  });

  describe("initialLineToggles handling", () => {
    it("should handle initialLineToggles updates", () => {
      const configWithToggles = {
        ...mockConfig,
        files: {
          ...mockConfig.files,
          ["otel_ref.yaml"]: {
            ...mockConfig.files["otel_ref.yaml"],
            initialLineToggles: { 73: true, 74: true },
          },
        },
      };

      const panelStateWithToggles = {
        ...mockPanelState,
        config: configWithToggles,
      };

      mockUseSelector.mockReturnValue(panelStateWithToggles);

      const { result } = renderHook(() => useGetConfigSimulatorContent());

      // Should show new values for toggled lines
      const changeBlock = result.current.tabContents[0].textGroups.find(
        (group) => group.isChangeBlock
      );
      const line73 = changeBlock?.lines.find((line) => line.lineNo === 73);
      const line74 = changeBlock?.lines.find((line) => line.lineNo === 74);

      expect(line73?.showingNewValue).toBe(true);
      expect(line74?.showingNewValue).toBe(true);
    });

    it("should clear line toggles when initialLineToggles is empty", () => {
      // Start with some toggles
      const configWithToggles = {
        ...mockConfig,
        files: {
          ...mockConfig.files,
          ["otel_ref.yaml"]: {
            ...mockConfig.files["otel_ref.yaml"],
            initialLineToggles: { 73: true },
          },
        },
      };

      const panelStateWithToggles = {
        ...mockPanelState,
        config: configWithToggles,
      };

      mockUseSelector.mockReturnValue(panelStateWithToggles);
      const { result, rerender } = renderHook(() =>
        useGetConfigSimulatorContent()
      );

      // Verify line is toggled
      let changeBlock = result.current.tabContents[0].textGroups.find(
        (group) => group.isChangeBlock
      );
      let line73 = changeBlock?.lines.find((line) => line.lineNo === 73);
      expect(line73?.showingNewValue).toBe(true);

      // Clear toggles
      const configWithoutToggles = {
        ...mockConfig,
        files: {
          ...mockConfig.files,
          ["otel_ref.yaml"]: {
            ...mockConfig.files["otel_ref.yaml"],
            initialLineToggles: {},
          },
        },
      };

      const panelStateWithoutToggles = {
        ...mockPanelState,
        config: configWithoutToggles,
      };

      mockUseSelector.mockReturnValue(panelStateWithoutToggles);
      rerender();

      // Verify line is no longer toggled
      changeBlock = result.current.tabContents[0].textGroups.find(
        (group) => group.isChangeBlock
      );
      line73 = changeBlock?.lines.find((line) => line.lineNo === 73);
      expect(line73?.showingNewValue).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle empty config", () => {
      const emptyPanelState = {
        ...mockPanelState,
        config: null,
      };
      mockUseSelector.mockReturnValue(emptyPanelState);
      const { result } = renderHook(() => useGetConfigSimulatorContent());

      expect(result.current.tabContents.length).toEqual(0);
    });

    it("should handle config with no changes", () => {
      const configNoChanges = {
        ...mockConfig,
        files: {
          ...mockConfig.files,
          ["otel_ref.yaml"]: {
            ...mockConfig.files["otel_ref.yaml"],
            changes: [],
          },
        },
      };

      const panelStateNoChanges = {
        ...mockPanelState,
        config: configNoChanges,
      };

      mockUseSelector.mockReturnValue(panelStateNoChanges);
      const { result } = renderHook(() => useGetConfigSimulatorContent());

      expect(result.current.tabContents[0].textGroups).toHaveLength(0);
    });

    it("should handle empty text", () => {
      const configEmptyText = {
        ...mockConfig,
        files: {
          ...mockConfig.files,
          ["otel_ref.yaml"]: {
            ...mockConfig.files["otel_ref.yaml"],
            text: "",
          },
        },
      };

      const panelStateEmptyText = {
        ...mockPanelState,
        config: configEmptyText,
      };

      mockUseSelector.mockReturnValue(panelStateEmptyText);
      const { result } = renderHook(() => useGetConfigSimulatorContent());

      expect(result.current.tabContents[0].textGroups).toEqual([]);
    });
  });

  describe("selector integration", () => {
    it("should handle missing config in selector", () => {
      const panelStateNoConfig = {
        ...mockPanelState,
        config: null,
      };
      mockUseSelector.mockReturnValue(panelStateNoConfig);
      const { result } = renderHook(() => useGetConfigSimulatorContent());

      expect(result.current.tabContents.length).toEqual(0);
      expect(result.current.tabContents).toEqual([]);
    });

    it("should handle empty panel state from selector", () => {
      const emptyPanelState = {
        isShowingPreviousContent: false,
        animations: [],
        config: null,
        terminal: null,
        status: null,
        logs: null,
        banner: null,
      };
      mockUseSelector.mockReturnValue(emptyPanelState);
      const { result } = renderHook(() => useGetConfigSimulatorContent());

      expect(result.current.tabContents.length).toEqual(0);
      expect(result.current.tabContents).toEqual([]);
    });
  });
});
