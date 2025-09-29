import { act, cleanup, renderHook } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { useGetConfigSimulatorContent } from "../useGetConfigSimulatorContent";

const originalRAF = global.requestAnimationFrame;
const originalCAF = global.cancelAnimationFrame;

vi.mock("../../useHighlander", () => ({
  useHighlander: vi.fn(() => ({
    state: {
      navigation: { view: "test" },
      animationIndex: 0,
    },
    actions: {
      INCREMENT_ANIMATION: vi.fn(),
      SET_ACTIVE_TAB: vi.fn(),
    },
  })),
}));

vi.mock("../../useSelector", () => ({
  useSelector: vi.fn(),
}));

vi.mock("../../../contexts/selectors", () => ({
  selectPanelState: vi.fn(),
  selectActiveTab: vi.fn(),
}));

let rafId = 0;
const rafCallbacks = new Map<number, () => void>();

const mockRAF = vi.fn((cb: FrameRequestCallback) => {
  const id = ++rafId;
  const timeout = setTimeout(() => {
    rafCallbacks.delete(id);
    cb(performance.now());
  }, 0);
  rafCallbacks.set(id, () => clearTimeout(timeout));
  return id;
});

const mockCAF = vi.fn((id: number) => {
  const cancel = rafCallbacks.get(id);
  if (cancel) {
    cancel();
    rafCallbacks.delete(id);
  }
});

import { selectActiveTab, selectPanelState } from "../../../contexts/selectors";
import { useSelector } from "../../useSelector";

const mockUseSelector = vi.mocked(useSelector);
const mockSelectPanelState = vi.mocked(selectPanelState);
const mockSelectActiveTab = vi.mocked(selectActiveTab);

const mockYaml = `apiVersion: opentelemetry.io/v1beta1
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
    `;

const createMockConfig = () => ({
  files: {
    ["otel_ref.yaml"]: {
      text: mockYaml,
      title: "otel_ref.yaml",
      changes: [
        {
          start: 4,
          end: 9,
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
          start: 11,
          end: 12,
          oldValues: [
            "              # UNCOMMENT THE FOLLOWING LINE TO START FILTRATION",
            "              # filter/static_filter",
          ],
        },
      ],
      initialLineToggles: {
        12: true,
        11: true,
      },
      showToggleButtons: false,
    },
  },
});

describe("useGetConfigSimulatorContent", () => {
  const mockPanelState = {
    isShowingPreviousContent: false,
    animations: [],
    config: createMockConfig(),
    terminal: null,
    status: null,
    logs: null,
    banner: null,
  };

  beforeEach(() => {
    rafCallbacks.forEach((cancel) => cancel());
    rafCallbacks.clear();
    vi.useFakeTimers();

    mockUseSelector.mockImplementation((selector) => {
      if (selector === mockSelectPanelState) {
        return mockPanelState;
      }
      if (selector === mockSelectActiveTab) {
        return "otel_ref.yaml";
      }
      return undefined;
    });

    global.requestAnimationFrame = mockRAF;
    global.cancelAnimationFrame = mockCAF;

    mockSelectPanelState.mockReturnValue(mockPanelState);
    mockSelectActiveTab.mockReturnValue("otel_ref.yaml");
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.clearAllTimers();
    vi.clearAllMocks();
    vi.restoreAllMocks();
    rafCallbacks.forEach((cancel) => cancel());
    rafCallbacks.clear();
    global.requestAnimationFrame = originalRAF;
    global.cancelAnimationFrame = originalCAF;
    if (global.gc) {
      global.gc();
    }
  });

  afterAll(() => {
    rafCallbacks.clear();
  });

  describe("basic functionality", () => {
    it("should return the correct title", () => {
      const { result, unmount } = renderHook(() =>
        useGetConfigSimulatorContent()
      );
      expect(result.current.tabContents[0].title).toBe("otel_ref.yaml");
      unmount();
    });

    it("should return showToggleButtons value", () => {
      const { result, unmount } = renderHook(() =>
        useGetConfigSimulatorContent()
      );
      expect(result.current.tabContents[0].showToggleButtons).toBe(false);
      unmount();
    });

    it("should return containerRef", () => {
      const { result, unmount } = renderHook(() =>
        useGetConfigSimulatorContent()
      );
      expect(result.current.tabContents[0].containerRef).toBeDefined();
      expect(result.current.tabContents[0].containerRef.current).toBeNull();
      unmount();
    });

    it("should return toggleLineValue function", () => {
      const { result, unmount } = renderHook(() =>
        useGetConfigSimulatorContent()
      );
      expect(typeof result.current.tabContents[0].toggleLineValue).toBe(
        "function"
      );
      unmount();
    });
  });

  describe("textGroups generation", () => {
    it("should generate the correct number of textGroups", () => {
      const { result, unmount } = renderHook(() =>
        useGetConfigSimulatorContent()
      );
      expect(result.current.tabContents[0].textGroups).toHaveLength(5);
      unmount();
    });

    it("should correctly identify change blocks", () => {
      const { result, unmount } = renderHook(() =>
        useGetConfigSimulatorContent()
      );
      const changeBlocks = result.current.tabContents[0].textGroups.filter(
        (group) => group.isChangeBlock
      );
      expect(changeBlocks).toHaveLength(2);
      unmount();
    });

    it("should correctly identify gap sections", () => {
      // TODO: fix this test, need to refine the text yaml
      const { result, unmount } = renderHook(() =>
        useGetConfigSimulatorContent()
      );
      const gapBlocks = result.current.tabContents[0].textGroups.filter(
        (group) => group.isGap
      );
      expect(gapBlocks).toHaveLength(0);
      unmount();
    });

    it("should match expected structure for first change block", () => {
      const { result, unmount } = renderHook(() =>
        useGetConfigSimulatorContent()
      );
      const firstChangeBlock = result.current.tabContents[0].textGroups.find(
        (group) => group.isChangeBlock
      );

      expect(firstChangeBlock).toEqual({
        lines: [
          {
            lineNo: 4,
            content:
              "      # UNCOMMENT THE FOLLOWING LINE TO ADD FILTER PROCESSOR",
            isHighlighted: true,
            newValue: "labels:",
            showingNewValue: false,
            isGap: false,
          },
          {
            lineNo: 5,
            content: "      # filter/static_filter:",
            isHighlighted: true,
            newValue: "  mdaihub-name: mdaihub-sample",
            showingNewValue: false,
            isGap: false,
          },
          {
            lineNo: 6,
            content: "      #   error_mode: ignore",
            isHighlighted: true,
            newValue: "name: gateway",
            showingNewValue: false,
            isGap: false,
          },
          {
            lineNo: 7,
            content: "      #   logs:",
            isHighlighted: true,
            newValue: "namespace: mdai",
            showingNewValue: false,
            isGap: false,
          },
          {
            lineNo: 8,
            content: "      #     log_record:",
            isHighlighted: true,
            newValue: "spec:",
            showingNewValue: false,
            isGap: false,
          },
          {
            lineNo: 9,
            content:
              '      #       - \'IsMatch(attributes["mdai_service"], "service4321")\'',
            isHighlighted: true,
            newValue: "managementState: managed",
            showingNewValue: false,
            isGap: false,
          },
        ],
        startLineNo: 4,
        endLineNo: 9,
        isChangeBlock: true,
        isGap: false,
        sectionIndex: 0,
        groupIndex: 1,
      });
      unmount();
    });

    it("should match expected structure for second change block", () => {
      const { result, unmount } = renderHook(() =>
        useGetConfigSimulatorContent()
      );
      const changeBlocks = result.current.tabContents[0].textGroups.filter(
        (group) => group.isChangeBlock
      );
      const secondChangeBlock = changeBlocks[1];

      expect(secondChangeBlock).toEqual({
        lines: [
          {
            lineNo: 11,
            content:
              "              # UNCOMMENT THE FOLLOWING LINE TO START FILTRATION",
            isHighlighted: true,
            newValue: "replicas: 1",
            showingNewValue: true,
            isGap: false,
          },
          {
            lineNo: 12,
            content: "              # filter/static_filter",
            isHighlighted: true,
            newValue: "resources:",
            showingNewValue: true,
            isGap: false,
          },
        ],
        startLineNo: 11,
        endLineNo: 12,
        isChangeBlock: true,
        isGap: false,
        sectionIndex: 0,
        groupIndex: 3,
      });
      unmount();
    });
  });

  describe("line toggling functionality", () => {
    it("should toggle line values correctly", () => {
      const { result, unmount } = renderHook(() =>
        useGetConfigSimulatorContent()
      );

      act(() => {
        result.current.tabContents[0].toggleLineValue([73, 74]);
      });

      expect(result.current.tabContents[0].pulsedLines.has(73)).toBe(true);
      expect(result.current.tabContents[0].pulsedLines.has(74)).toBe(true);
      unmount();
    });

    it("should clear pulsed lines after timeout", async () => {
      vi.useFakeTimers();

      const { result, unmount } = renderHook(() =>
        useGetConfigSimulatorContent()
      );

      act(() => {
        result.current.tabContents[0].toggleLineValue([73]);
      });

      expect(result.current.tabContents[0].pulsedLines.has(73)).toBe(true);

      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(result.current.tabContents[0].pulsedLines.has(73)).toBe(false);

      unmount();
      vi.useRealTimers();
    });

    it("should update showingNewValue when lines are toggled", () => {
      const { result, unmount } = renderHook(() =>
        useGetConfigSimulatorContent()
      );

      act(() => {
        result.current.tabContents[0].toggleLineValue([4]);
      });

      const changeBlock = result.current.tabContents[0].textGroups.find(
        (group) => group.isChangeBlock
      );
      const toggledLine = changeBlock?.lines.find((line) => line.lineNo === 4);

      expect(toggledLine?.showingNewValue).toBe(true);
      unmount();
    });
  });

  describe("initialLineToggles handling", () => {
    it("should handle initialLineToggles updates", () => {
      const mockConfig = createMockConfig();
      const configWithToggles = {
        ...mockConfig,
        files: {
          ...mockConfig.files,
          ["otel_ref.yaml"]: {
            ...mockConfig.files["otel_ref.yaml"],
            initialLineToggles: { 4: true, 5: true },
          },
        },
      };

      const panelStateWithToggles = {
        ...mockPanelState,
        config: configWithToggles,
      };

      mockUseSelector.mockReturnValue(panelStateWithToggles);

      const { result, unmount } = renderHook(() =>
        useGetConfigSimulatorContent()
      );

      const changeBlock = result.current.tabContents[0].textGroups.find(
        (group) => group.isChangeBlock
      );
      const line4 = changeBlock?.lines.find((line) => line.lineNo === 4);
      const line5 = changeBlock?.lines.find((line) => line.lineNo === 5);

      expect(line4?.showingNewValue).toBe(true);
      expect(line5?.showingNewValue).toBe(true);
      unmount();
    });

    it("should clear line toggles when initialLineToggles is empty", () => {
      const mockConfig = createMockConfig();
      const configWithToggles = {
        ...mockConfig,
        files: {
          ...mockConfig.files,
          ["otel_ref.yaml"]: {
            ...mockConfig.files["otel_ref.yaml"],
            initialLineToggles: { 4: true },
          },
        },
      };

      const panelStateWithToggles = {
        ...mockPanelState,
        config: configWithToggles,
      };

      mockUseSelector.mockReturnValue(panelStateWithToggles);
      const { result, rerender, unmount } = renderHook(() =>
        useGetConfigSimulatorContent()
      );

      let changeBlock = result.current.tabContents[0].textGroups.find(
        (group) => group.isChangeBlock
      );
      let line4 = changeBlock?.lines.find((line) => line.lineNo === 4);
      expect(line4?.showingNewValue).toBe(true);

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

      changeBlock = result.current.tabContents[0].textGroups.find(
        (group) => group.isChangeBlock
      );
      line4 = changeBlock?.lines.find((line) => line.lineNo === 4);
      expect(line4?.showingNewValue).toBe(false);

      unmount();
    });
  });

  describe.only("edge cases", () => {
    it.only("should handle empty config", () => {
      const emptyPanelState = {
        ...mockPanelState,
        config: null,
      };
      mockUseSelector.mockReturnValue(emptyPanelState);
      const { result, unmount } = renderHook(() =>
        useGetConfigSimulatorContent()
      );

      expect(result.current.tabContents.length).toEqual(0);
      unmount();
    });

    it("should handle config with no changes", () => {
      const mockConfig = createMockConfig();
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
      const { result, unmount } = renderHook(() =>
        useGetConfigSimulatorContent()
      );

      expect(result.current.tabContents[0].textGroups).toHaveLength(0);
      unmount();
    });

    it("should handle empty text", () => {
      const mockConfig = createMockConfig();
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
      const { result, unmount } = renderHook(() =>
        useGetConfigSimulatorContent()
      );

      expect(result.current.tabContents[0].textGroups).toEqual([]);
      unmount();
    });
  });

  describe("selector integration", () => {
    it("should handle missing config in selector", () => {
      const panelStateNoConfig = {
        ...mockPanelState,
        config: null,
      };
      mockUseSelector.mockReturnValue(panelStateNoConfig);
      const { result, unmount } = renderHook(() =>
        useGetConfigSimulatorContent()
      );

      expect(result.current.tabContents.length).toEqual(0);
      expect(result.current.tabContents).toEqual([]);
      unmount();
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
      const { result, unmount } = renderHook(() =>
        useGetConfigSimulatorContent()
      );

      expect(result.current.tabContents.length).toEqual(0);
      expect(result.current.tabContents).toEqual([]);
      unmount();
    });
  });
});
