import { parse } from "yaml";
import { transformSubstepConfigToInstanceArgs } from "../animationEngine/configToEngineTransforms";
import type { TourConfiguration } from "./configTypesScratch";
import type { TourEngine } from "./engineTypesScratch";
import { fetchGitHubFile } from "./fetchRawGithubFile";

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
    const yamlContent = await fetchGitHubFile(url);
    const config = parseYaml(yamlContent) as TourConfiguration;

    validateTourConfig(config);

    return transformParsedTourConfigToInstanceArgs(config);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load tour config: ${message}`);
  }
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

  if (!c.id || !c.version || !c.title || !Array.isArray(c.steps)) {
    throw new Error(
      "Invalid config: missing required fields (id, version, title, steps)"
    );
  }
}

function transformParsedTourConfigToInstanceArgs(
  config: TourConfiguration
): TourEngine {
  const transformedSteps = config.steps.map((step) => {
    const transformedSubsteps = step.substeps.map((subStep) => {
      const transformed = transformSubstepConfigToInstanceArgs(subStep);
      return {
        ...subStep,
        ...transformed,
      };
    });

    return {
      ...step,
      substeps: transformedSubsteps,
    };
  });

  return {
    ...config,
    steps: transformedSteps,
  };
}
