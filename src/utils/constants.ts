import type { NavigationState, View } from "./types";

export const Logs: View = "Logs";
export const Traces: View = "Traces";
export const PII: View = "PII";
export const Home: View = "Home";

export const contactUrl = `mailto:${import.meta.env.VITE_CONTACT_EMAIL}`;
export const contactAPIEndpoint = import.meta.env.VITE_CONTACT_API_URL;

export const ITEM_IDS = {
  introduction: "introduction",
  step1: "step1",
  step2: "step2",
  step3: "step3",
  introduction_meet: "introduction_meet",
  introduction_guide: "introduction_guide",
  introduction_consolidated: "introduction_consolidated",
  step1_data: "step1_data",
  step1_results: "step1_results",
  step2_configure: "step2_configure",
  step2_take: "step2_take",
  step2_explore: "step2_explore",
  step2_visualize: "step2_visualize",
  step3_add: "step3_add",
  step3_take: "step3_take",
  step3_vizualize: "step3_vizualize",
  Logs,
  Traces,
  PII,
} as const;

export const TERMINAL_PROMPT = "eng@local-terminal > ";
export const CURSOR_CHAR = "█";

export const DEFAULT_ANIMATION_STEP_DURATION = 750;

export const LOGS_DEFAULT_STEPS: NavigationState = {
  view: Logs,
  step: ITEM_IDS.introduction,
  subStep: ITEM_IDS.introduction_meet,
};
