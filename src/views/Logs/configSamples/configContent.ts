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

export const staticFilterNoCommentConfig: ConfigTextProps = {
  files: {
    ["otel_ref.yaml"]: {
      text: staticFilterNoComment,
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
      href: "https://github.com/DecisiveAI/mdai-labs/blob/main/otel/otel_ref.yaml",
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
        { start: 11, end: 17, oldValues: [] },
        { start: 43, end: 47, oldValues: [] },
        { start: 81, end: 86, oldValues: [] },
      ],
    },
    ["otel_ref.yaml"]: {
      text: dynamicFilter,
      // TODO: Add href for this file
      changes: [
        { start: 73, end: 77, oldValues: [] },
        { start: 99, end: 99, oldValues: [] },
      ],
    },
  },
  activeFileTitle: "hub_ref.yaml",
};
