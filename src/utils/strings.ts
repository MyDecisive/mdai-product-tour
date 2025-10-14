import { Home, Logs, PII, Traces } from "./constants";
import type { View } from "./types";

const homeTitle = "MyDecisive.ai Demo";
const viewTitles: Record<View, string> = {
  [Logs]: "Dynamic Log Filtering",
  [Traces]: "Dynamic Traces Filtering",
  [PII]: "PII Redaction",
  [Home]: homeTitle,
};

export function getViewTitle(view?: View) {
  if (view) {
    return viewTitles[view];
  }

  return homeTitle;
}

export function parseTypedJsString(str: string) {
  return str.replaceAll(/`/gi, "").replaceAll(/\^\d+/gi, "");
}
