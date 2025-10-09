import { useCallback, useEffect, useRef, useState } from "react";
import type { SubstepConfig } from "../utils/configTypesScratch";
import type { STATUS } from "../utils/constants";
import type {
  EngineFrames,
  EngineTargetState,
  PodId,
} from "../utils/engineTypesScratch";
import type { SimulatorType } from "../utils/types";
import { AnimationEngineInstance } from "./class";
import {
  transformConfigToEngineAnimation,
  transformConfigToEngineState,
} from "./configToEngineTransforms";

export interface AnimationEngineState {
  isPlaying: boolean;
  currentSimulatorState: EngineTargetState;
  activeSimulator: Set<SimulatorType>;
}

export interface AnimationEngineControls {
  reset: (str?: string) => void; // Reset to previous substep's target state and replay
  play: (str?: string) => void; // Begin animations
  advanceAnimation: () => void; // Signal that current action is complete
  onPodStatusChange: (
    podId: PodId,
    newStatus: (typeof STATUS)[keyof typeof STATUS]
  ) => void;
}

export function useAnimationEngine(
  substep: SubstepConfig,
  previousState: EngineTargetState,
  onComplete: () => void
): [AnimationEngineState, AnimationEngineControls] {
  const { animation = [], targetState } = substep;
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
    setTerminalState((prev) =>
      state.terminal !== prev ? state.terminal : prev
    );
    setStatusState((prev) => (state.status !== prev ? state.status : prev));
    // setConfigState((prev) => (state.config !== prev ? state.config : prev));
    // setLogsState((prev) => (state.logs !== prev ? state.logs : prev));
    // setBannerState((prev) => (state.banner !== prev ? state.banner : prev));
  }, []);

  useEffect(() => {
    const engineTargetState: EngineTargetState =
      transformConfigToEngineState(targetState);
    const frames: EngineFrames.Any[] =
      transformConfigToEngineAnimation(animation);

    const engine = new AnimationEngineInstance(
      frames,
      previousState,
      engineTargetState,
      {
        onStateChange: updateSimulatorStates,
        onActiveSimulatorChange: (sim: SimulatorType | null) => {
          setActiveSimulator(sim === null ? new Set() : new Set([sim]));
        },
        onComplete: () => {
          setIsPlaying(false);
          onComplete();
        },
      }
    );

    engineRef.current = engine;

    updateSimulatorStates(previousState);
    setIsPlaying(false);

    return () => {
      engine.cleanup();
    };
  }, [substep, previousState, onComplete]);

  const controls: AnimationEngineControls = {
    play: useCallback((caller?: string) => {
      setIsPlaying(true);
      engineRef.current?.play(caller);
    }, []),

    reset: useCallback((caller?: string) => {
      engineRef.current?.reset(caller);
      setIsPlaying(false);
    }, []),

    advanceAnimation: useCallback(() => {
      engineRef.current?.advanceAnimation();
    }, []),

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
