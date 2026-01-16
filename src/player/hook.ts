import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AnyFrame } from "../types/frames";
import type { PodStatus, Simulator } from "../types/kinds";
import type { Player, PodId } from "../types/player";
import { STATUS } from "../utils/constants";
import { PlayerInstance } from "./class";

export interface PlayerState {
  isPlaying: boolean;
  currentSimulatorState: Player;
  activeSimulator: Set<Simulator>;
}

export interface PlayerControls {
  // generic
  reset: (str?: string) => void; // Reset to previous subStep's target state and replay
  play: () => void; // Begin animations
  onTriggerFrame: (frame: AnyFrame) => void;
  // status sim
  onPodStatusChange: (podId: PodId, newStatus: PodStatus) => void;
  // config sim
  onSetActiveTab: (tabName: string) => void;
  onToggleShowingChange: (groupId: string) => void;
  onConfigScrollComplete: (scrollId: string) => void;
  // terminal sim:
  onTerminalContentPrinted: (index: number) => void;
}

export function useAnimationEngine(
  targetState: Player,
  frames: AnyFrame[],
  previousState: Player,
  onCompleteCallback: () => void
): [PlayerState, PlayerControls] {
  const [isPlaying, setIsPlaying] = useState(false);
  const [terminalState, setTerminalState] = useState(previousState.terminal);
  const [statusState, setStatusState] = useState(previousState.status);
  const [configState, setConfigState] = useState(previousState.config);
  const [logsState, setLogsState] = useState(previousState.logs);
  const [bannerState, setBannerState] = useState(previousState.banner);
  const [activeSimulator, setActiveSimulator] = useState<Set<Simulator>>(
    new Set()
  );

  const engineRef = useRef<PlayerInstance | null>(null);

  const updateSimulatorStates = useCallback((state: Player) => {
    setTerminalState((prev) =>
      state.terminal !== prev ? state.terminal : prev
    );
    setStatusState((prev) => (state.status !== prev ? state.status : prev));
    setConfigState((prev) => (state.config !== prev ? state.config : prev));
    setLogsState((prev) => (state.logs !== prev ? state.logs : prev));
    setBannerState((prev) => (state.banner !== prev ? state.banner : prev));
  }, []);

  const handleSetActiveSimulator = useCallback((sim: Simulator | null) => {
    setActiveSimulator((old) => {
      if (sim === null) {
        return new Set();
      }
      const newActive = new Set(old);
      if (newActive.has(sim)) {
        newActive.delete(sim);
      } else {
        newActive.add(sim);
      }
      return newActive;
    });
  }, []);

  useEffect(() => {
    const engine = new PlayerInstance(frames, previousState, targetState, {
      onStateChange: updateSimulatorStates,
      onActiveSimulatorChange: handleSetActiveSimulator,
      onComplete: () => {
        setIsPlaying(false);
        setActiveSimulator(new Set());
        onCompleteCallback();
      },
    });

    engineRef.current = engine;

    updateSimulatorStates(previousState);
    setIsPlaying(false);

    return () => {
      engine.cleanup();
    };
  }, [
    targetState,
    frames,
    updateSimulatorStates,
    previousState,
    onCompleteCallback,
    handleSetActiveSimulator,
  ]);

  const controls = useMemo<PlayerControls>(
    () => ({
      play: () => {
        if (!isPlaying) {
          setIsPlaying(true);
          void engineRef.current?.play();
        }
      },

      reset: () => {
        engineRef.current?.reset();
        setIsPlaying(false);
      },

      onTriggerFrame: (frame: AnyFrame) => {
        void engineRef.current?.executeAction(frame);
      },

      onPodStatusChange: (
        podId: PodId,
        newStatus: (typeof STATUS)[keyof typeof STATUS]
      ) => {
        if (!isPlaying) return;
        engineRef.current?.onPodStatusChange(podId, newStatus);
      },

      onSetActiveTab: (tabName: string) => {
        engineRef.current?.onSetActiveTab(tabName);
      },

      onToggleShowingChange: (groupId: string) => {
        engineRef.current?.onToggleShowingChange(groupId);
      },

      onConfigScrollComplete(scrollId: string) {
        engineRef.current?.onConfigScrollComplete(scrollId);
      },

      onTerminalContentPrinted: (index: number) => {
        engineRef.current?.setTerminalContentPrinted(index);
      },
    }),
    [isPlaying]
  );

  return [
    {
      isPlaying,
      currentSimulatorState: {
        terminal: terminalState,
        status: statusState,
        logs: logsState,
        config: configState,
        banner: bannerState,
      },
      activeSimulator,
    },
    controls,
  ];
}
