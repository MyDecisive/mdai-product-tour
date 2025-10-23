import {
  createChangeMap,
  createConfigContentGroups,
  extractRelevantSections,
  rawLinesFromText,
} from "../../../hooks/useGetConfigSimulatorContent/utils";
import type { ConfigTextProps } from "../../../utils/types";
import hubConfig from "./mdaiHubSample.yaml?raw";
import dynamicFilter from "./otelSampleDynamic.yaml?raw";
import staticFilterNoComment from "./otelSampleStaticNoComment.yaml?raw";

export function buildInitialToggles(
  start: number,
  end: number
): Record<string, boolean> {
  const initialToggles: Record<string, boolean> = {};
  if (end < start) {
    throw new Error("nope");
  }

  for (let i = start; i <= end; i++) {
    initialToggles[i] = true;
  }

  return initialToggles;
}

export const staticFilterNoCommentChanges = [
  {
    start: 73,
    end: 78,
    changeLines: [
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
    changeLines: [
      "              # UNCOMMENT THE FOLLOWING LINE TO START FILTRATION",
      "              # filter/static_filter",
    ],
  },
];
export const staticFilterNoCommentConfigContentGroups =
  createConfigContentGroups(
    "otel_ref.yaml",
    extractRelevantSections(
      rawLinesFromText(staticFilterNoComment),
      staticFilterNoCommentChanges
    ),
    createChangeMap(staticFilterNoCommentChanges)
  );
export const staticFilterNoCommentConfig: ConfigTextProps = {
  files: {
    ["otel_ref.yaml"]: {
      text: staticFilterNoComment,
      changes: staticFilterNoCommentChanges,
      href: "https://github.com/DecisiveAI/mdai-labs/blob/main/otel/otel_ref.yaml",
      initialLineToggles: {},
    },
  },
  activeFileTitle: "otel_ref.yaml",
};

export const step3HubConfig: ConfigTextProps = {
  files: {
    ["hub_ref.yaml"]: {
      text: hubConfig,
      href: "https://github.com/DecisiveAI/mdai-labs/blob/0.8.5-rc/mdai/hub/0.8.5/hub_ref.yaml",
      changes: [
        { start: 11, end: 17, changeLines: [] },
        { start: 43, end: 47, changeLines: [] },
        { start: 81, end: 86, changeLines: [] },
      ],
      initialLineToggles: {},
    },
    ["otel_ref.yaml"]: {
      text: dynamicFilter,
      // TODO: Add href for this file
      changes: [
        { start: 73, end: 77, changeLines: [] },
        { start: 99, end: 99, changeLines: [] },
      ],
      initialLineToggles: {},
    },
  },
  activeFileTitle: "hub_ref.yaml",
};
