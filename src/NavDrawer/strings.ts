import { DLF, DTF, PII } from "../constants";
import type { View } from "../types";

const viewTitles: Record<View, string> = {
  [DLF]: "Dynamic Log Filtering",
  [DTF]: "Dynamic Traces Filtering",
  [PII]: "PII Redaction",
};

const homeTitle = "MyDecisive.ai Demo";

export function getViewTitle(view?: View) {
  if (view) {
    return viewTitles[view];
  }

  return homeTitle;
}
