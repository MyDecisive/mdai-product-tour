import { Logs, PII, Traces } from "../constants";
import type { View } from "../types";

const viewTitles: Record<View, string> = {
  [Logs]: "Dynamic Log Filtering",
  [Traces]: "Dynamic Traces Filtering",
  [PII]: "PII Redaction",
};

const homeTitle = "MyDecisive.ai Demo";

export function getViewTitle(view?: View) {
  if (view) {
    return viewTitles[view];
  }

  return homeTitle;
}
