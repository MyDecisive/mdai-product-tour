import { transformSubStepConfigToInstanceArgs } from "./configToEngineTransforms";
import type {
  StepConfig,
  SubStepConfig,
  TourConfiguration,
} from "./configTypesScratch";
import type {
  EngineStep,
  EngineSubStep,
  EngineTargetState,
  TourEngine,
} from "./engineTypesScratch";
import { prefetchAllGitHubFiles } from "./fetchRawGithubFile";
import { getTourConfigs } from "./getAssets";
import type { NavigationState } from "./types";

export function getAllParsedTourConfigs() {
  try {
    const configs = getTourConfigs();

    configs.forEach(validateTourConfig);

    return Promise.all(configs.map(transformParsedTourConfigToInstanceArgs));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load tour config: ${message}`);
  }
}

/**
 * Basic validation of tour config structure
 */
function validateTourConfig(
  config: unknown
): asserts config is TourConfiguration {
  if (!config || typeof config !== "object") {
    throw new Error("Invalid config: must be an object");
  }

  const c = config as Partial<TourConfiguration>;

  if (!c.id || !c.version || !c.title || (c.steps && !Array.isArray(c.steps))) {
    throw new Error(
      "Invalid config: missing required fields (id, version, title, steps)"
    );
  }
}

async function transformParsedTourConfigToInstanceArgs(
  config: TourConfiguration
): Promise<TourEngine> {
  await prefetchAllGitHubFiles(config);

  let previousTargetState: EngineTargetState | undefined;
  const transformedSteps: EngineStep[] = [];

  for (const step of config?.steps || []) {
    const transformedSubSteps: EngineSubStep[] = [];

    for (const [subStepIndex, subStep] of (step?.subSteps || []).entries()) {
      const { id, title, visualizationModal } = subStep;

      const stepIndex = transformedSteps.length;
      const stepsArr = config.steps || [];
      const subStepsArr = step.subSteps || [];

      const nextSubStep = createNextNavState(
        config.id,
        stepIndex,
        stepsArr,
        subStepIndex,
        subStepsArr
      );
      const previousSubStep = createPrevNavState(
        config.id,
        stepIndex,
        stepsArr,
        subStepIndex,
        subStepsArr
      );

      const transformed = await transformSubStepConfigToInstanceArgs(
        subStep,
        previousTargetState
      );

      if (transformed.targetState) {
        previousTargetState = transformed.targetState;
      }
      transformedSubSteps.push({
        nextSubStep,
        previousSubStep,
        id,
        title,
        visualizationModal,
        ...transformed,
      });
    }

    transformedSteps.push({
      ...step,
      subSteps: transformedSubSteps,
    });
  }

  return {
    ...config,
    steps: transformedSteps,
  };
}

function createNextNavState(
  tourId: string,
  stepIndex: number,
  stepsArr: StepConfig[],
  subStepIndex: number,
  subStepsArr: SubStepConfig[]
): NavigationState {
  const returnNavState: Pick<NavigationState, "tour" | "bigContentModal"> &
    Partial<NavigationState> = {
    tour: tourId,
    bigContentModal: null,
  };
  const nextSubStep = subStepsArr[subStepIndex + 1];

  if (nextSubStep) {
    returnNavState.step = stepIndex;
    returnNavState.subStep = subStepIndex + 1;

    if (nextSubStep.visualizationModal) {
      returnNavState.bigContentModal = "results";
    }

    return returnNavState as NavigationState;
  }

  const nextStep = stepsArr[stepIndex + 1];
  if (nextStep) {
    returnNavState.step = stepIndex + 1;
    returnNavState.subStep = 0;

    if (nextStep.subSteps[0].visualizationModal) {
      returnNavState.bigContentModal = "results";
    }

    return returnNavState as NavigationState;
  }

  return {
    tour: "",
    step: -1,
    subStep: -1,
    bigContentModal: null,
  };
}

function createPrevNavState(
  tourId: string,
  stepIndex: number,
  stepsArr: StepConfig[],
  subStepIndex: number,
  subStepsArr: SubStepConfig[]
): NavigationState {
  const returnNavState: Pick<NavigationState, "tour" | "bigContentModal"> &
    Partial<NavigationState> = {
    tour: tourId,
    bigContentModal: null,
  };

  const prevSubStepIndex = subStepIndex - 1;
  if (prevSubStepIndex >= 0) {
    returnNavState.step = stepIndex;
    returnNavState.subStep = prevSubStepIndex;

    if (subStepsArr[prevSubStepIndex].visualizationModal) {
      returnNavState.bigContentModal = "results";
    }

    return returnNavState as NavigationState;
  }

  const prevStepIndex = stepIndex - 1;
  if (prevStepIndex >= 0) {
    returnNavState.step = prevStepIndex;
    const prevStepsLastSubStepIndex =
      stepsArr[prevStepIndex].subSteps.length - 1;
    returnNavState.subStep = prevStepsLastSubStepIndex;

    if (
      stepsArr[prevStepIndex].subSteps[prevStepsLastSubStepIndex]
        .visualizationModal
    ) {
      returnNavState.bigContentModal = "results";
    }

    return returnNavState as NavigationState;
  }

  return {
    tour: "",
    step: -1,
    subStep: -1,
    bigContentModal: null,
  };
}
