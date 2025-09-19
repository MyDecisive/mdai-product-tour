import type { ConfigTextProps } from "../../../utils/types";
import staticFilterNoComment from "./otelSampleStaticNoComment.yaml?raw";

export const staticFilterNoCommentConfig: ConfigTextProps = {
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
        '      #       - \'IsMatch(attributes["mdai_service"], "service1234")\'',
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
  title: "otel_ref.yaml",
  href: "https://github.com/DecisiveAI/mdai-labs/blob/main/otel/otel_ref.yaml",
};

// export const step3HubConfigPartOne: ConfigTextProps = {
//   text: hubConfig,
//   title: "hub_ref.yaml",
//   href: "https://github.com/DecisiveAI/mdai-labs/blob/0.8.5-rc/mdai/hub/0.8.5/hub_ref.yaml",
//   activeRange: {
//     start: 10,
//     end: 17,
//   },
//   highlights: [
//     [11, 17],
//     [43, 47],
//     [81, 86],
//   ],
// };

// export const step3HubConfigPartTwo: ConfigTextProps = {
//   activeRange: {
//     start: 42,
//     end: 47,
//   },
// };
// export const step3HubConfigPartThree: ConfigTextProps = {
//   activeRange: {
//     start: 80,
//     end: 86,
//   },
// };

// export const step3OTelConfigPartOne: ConfigTextProps = {
//   text: dynamicFilter,
//   title: "otel_ref.yaml",
//   activeRange: {
//     start: 73,
//     end: 77,
//   },
//   highlights: [
//     [73, 77],
//     [99, 99],
//   ],
// };

// export const step3OTelConfigPartTwo: ConfigTextProps = {
//   activeRange: {
//     start: 97,
//     end: 107,
//   },
// };
