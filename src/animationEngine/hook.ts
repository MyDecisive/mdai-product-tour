import { useCallback, useEffect, useRef, useState } from "react";
import type { SubstepConfig } from "../utils/configTypesScratch";
import { STATUS } from "../utils/constants";
import type { EngineTargetState, PodId } from "../utils/engineTypesScratch";
import type { PodStatusType, SimulatorType } from "../utils/types";
import { AnimationEngineInstance } from "./class";
import { transformSubstepConfigToInstanceArgs } from "./configToEngineTransforms";

export interface AnimationEngineState {
  isPlaying: boolean;
  currentSimulatorState: EngineTargetState;
  activeSimulator: Set<SimulatorType>;
}

export interface AnimationEngineControls {
  reset: (str?: string) => void; // Reset to previous substep's target state and replay
  play: (str?: string) => void; // Begin animations
  advanceAnimation: (sim?: SimulatorType) => void; // Signal that current action is complete
  onPodStatusChange: (podId: PodId, newStatus: PodStatusType) => void;
}

export function useAnimationEngine(
  substep: SubstepConfig,
  previousState: EngineTargetState,
  onCompleteCallback: () => void
): [AnimationEngineState, AnimationEngineControls] {
  const [isPlaying, setIsPlaying] = useState(false);
  const [terminalState, setTerminalState] = useState(previousState.terminal);
  const [statusState, setStatusState] = useState(previousState.status);
  // const [configState, setConfigState] = useState(previousState.config);
  // const [logsState, setLogsState] = useState(previousState.logs);
  // const [bannerState, setBannerState] = useState(previousState.banner);
  const [activeSimulator, setActiveSimulator] = useState<Set<SimulatorType>>(
    new Set()
  );

  const engineRef = useRef<AnimationEngineInstance | null>(null);

  const updateSimulatorStates = useCallback((state: EngineTargetState) => {
    setTerminalState((prev) => {
      return state.terminal !== prev ? state.terminal : prev;
    });
    setStatusState((prev) => (state.status !== prev ? state.status : prev));
    // setConfigState((prev) => (state.config !== prev ? state.config : prev));
    // setLogsState((prev) => (state.logs !== prev ? state.logs : prev));
    // setBannerState((prev) => (state.banner !== prev ? state.banner : prev));
  }, []);

  const handleSetActiveSimulator = useCallback((sim: SimulatorType | null) => {
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
    const { targetState, frames } =
      transformSubstepConfigToInstanceArgs(substep);

    const engine = new AnimationEngineInstance(
      frames,
      previousState,
      targetState,
      {
        onStateChange: updateSimulatorStates,
        onActiveSimulatorChange: handleSetActiveSimulator,
        onComplete: () => {
          setIsPlaying(false);
          onCompleteCallback();
        },
      }
    );

    engineRef.current = engine;

    updateSimulatorStates(previousState);
    setIsPlaying(false);

    return () => {
      engine.cleanup();
    };
  }, [
    substep,
    updateSimulatorStates,
    previousState,
    onCompleteCallback,
    handleSetActiveSimulator,
  ]);

  const controls: AnimationEngineControls = {
    play: useCallback((caller?: string) => {
      setIsPlaying(true);
      void engineRef.current?.play(caller);
    }, []),

    reset: useCallback((caller?: string) => {
      engineRef.current?.reset(caller);
      setIsPlaying(false);
    }, []),

    advanceAnimation: useCallback(
      (caller?: SimulatorType) => {
        if (caller) {
          handleSetActiveSimulator(caller);
        }
        engineRef.current?.advanceAnimation();
      },
      [handleSetActiveSimulator]
    ),

    onPodStatusChange: useCallback(
      (podId: PodId, newStatus: (typeof STATUS)[keyof typeof STATUS]) => {
        engineRef.current?.onPodStatusChange(podId, newStatus);
      },
      []
    ),
  };

  return [
    {
      isPlaying,
      currentSimulatorState: {
        terminal: terminalState,
        status: statusState,
        // logs: logsState,
        // config: configState,
        // banner: bannerState,
      },
      activeSimulator,
    },
    controls,
  ];
}
