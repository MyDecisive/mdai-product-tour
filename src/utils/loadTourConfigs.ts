import { parse } from "yaml";
import { transformSubStepConfigToInstanceArgs } from "./configToEngineTransforms";
import type {
  StepConfig,
  SubStepConfig,
  TourConfiguration,
} from "./configTypesScratch";
import type { EngineSubStep, TourEngine } from "./engineTypesScratch";
import { fetchGitHubFile } from "./fetchRawGithubFile";
import type { NavigationState } from "./types";

const tourConfigUrls =
  (import.meta.env.VITE_TOUR_CONFIG_URLS as string)?.split(",") || [];

export async function loadAllTourConfigs(): Promise<TourEngine[]> {
  return Promise.all(tourConfigUrls.map((url) => loadTourConfig(url.trim())));
}

/**
 * Loads and parses a tour configuration from a GitHub URL
 */
async function loadTourConfig(url: string): Promise<TourEngine> {
  try {
    const yamlContent =
      import.meta.env.VITE_USE_LOCAL_CONFIGS === "true"
        ? await loadLocalConfig(url)
        : await fetchGitHubFile(url);

    const config = parseYaml(yamlContent) as TourConfiguration;

    validateTourConfig(config);

    return transformParsedTourConfigToInstanceArgs(config);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load tour config: ${message}`);
  }
}

async function loadLocalConfig(url: string): Promise<string> {
  // Extract filename from GitHub URL (e.g., "tour1.yml")
  const filename = url.split("/").pop() || "";

  // Import from local content folder
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const module = await import(`../views/${filename}.yaml?raw`);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  return typeof module.default === "string"
    ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      module.default
    : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      JSON.stringify(module.default);
}

/**
 * Parses YAML string to object
 */
function parseYaml(yamlString: string): unknown {
  try {
    return parse(yamlString);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`YAML parse error: ${error.message}`);
    }
    throw error;
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
  const transformedSteps = await Promise.all(
    (config?.steps || []).map(async (step, stepIndex, stepsArr) => {
      const transformedSubSteps = await Promise.all(
        step?.subSteps?.map(async (subStep, subStepIndex, subStepsArr) => {
          const { initialState, animation, ...engineCompatibleSubStep } =
            subStep;

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

          if (initialState || (animation && animation.length > 0)) {
            const transformed = await transformSubStepConfigToInstanceArgs(
              subStep
            );

            const converted: EngineSubStep = {
              nextSubStep,
              previousSubStep,
              ...engineCompatibleSubStep,
              ...transformed,
            };

            return converted;
          }
          return {
            ...engineCompatibleSubStep,
            nextSubStep,
            previousSubStep,
          };
        })
      );

      return {
        ...step,
        subSteps: transformedSubSteps,
      };
    })
  );

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
