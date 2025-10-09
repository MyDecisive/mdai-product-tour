import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AnimationEngineControls,
  AnimationEngineState,
  Animations,
  SimulatorTargetState,
  SimulatorType,
} from "../utils/types";
import { AnimationEngineInstance } from "./class";

export function useAnimationEngine(
  substep: {
    animations: Animations;
    targetState: SimulatorTargetState;
  },
  previousState: SimulatorTargetState,
  onComplete: () => void
): [AnimationEngineState, AnimationEngineControls] {
  const [isPlaying, setIsPlaying] = useState(false);
  const [terminalState, setTerminalState] = useState(previousState.terminal);
  const [configState, setConfigState] = useState(previousState.config);
  const [statusState, setStatusState] = useState(previousState.status);
  const [logsState, setLogsState] = useState(previousState.logs);
  const [bannerState, setBannerState] = useState(previousState.banner);
  const [activeSimulator, setActiveSimulator] = useState<Set<SimulatorType>>(
    new Set()
  );

  const engineRef = useRef<AnimationEngineInstance | null>(null);

  const updateSimulatorStates = useCallback((state: SimulatorTargetState) => {
    setTerminalState((prev) =>
      state.terminal !== prev ? state.terminal : prev
    );
    setConfigState((prev) => (state.config !== prev ? state.config : prev));
    setStatusState((prev) => (state.status !== prev ? state.status : prev));
    setLogsState((prev) => (state.logs !== prev ? state.logs : prev));
    setBannerState((prev) => (state.banner !== prev ? state.banner : prev));
  }, []);

  useEffect(() => {
    const engine = new AnimationEngineInstance(
      substep.animations || [],
      previousState,
      substep.targetState,
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
  };

  return [
    {
      isPlaying,
      currentSimulatorState: {
        logs: logsState,
        config: configState,
        terminal: terminalState,
        status: statusState,
        banner: bannerState,
      },
      activeSimulator,
    },
    controls,
  ];
}
